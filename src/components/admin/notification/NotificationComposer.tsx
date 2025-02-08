
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

interface PlatformStats {
  success: number;
  failed: number;
}

interface PushNotificationResponse {
  success: boolean;
  results: {
    successful: number;
    failed: number;
    platformStats?: Record<string, PlatformStats>;
  };
}

export const NotificationComposer = ({ onMessageSent }: { onMessageSent: () => Promise<void> }) => {
  const [title_en, setTitleEn] = useState("");
  const [title_ar, setTitleAr] = useState("");
  const [body_en, setBodyEn] = useState("");
  const [body_ar, setBodyAr] = useState("");
  const [sending, setSending] = useState(false);
  const [activeInput, setActiveInput] = useState<'title_en' | 'title_ar' | 'body_en' | 'body_ar' | null>(null);

  const handleEmojiSelect = (emoji: any) => {
    if (!activeInput) return;

    const setValue = {
      title_en: setTitleEn,
      title_ar: setTitleAr,
      body_en: setBodyEn,
      body_ar: setBodyAr
    }[activeInput];

    const currentValue = {
      title_en,
      title_ar,
      body_en,
      body_ar
    }[activeInput];

    setValue(currentValue + emoji.native);
  };

  const handleSendNotification = async () => {
    try {
      setSending(true);
      console.log('Starting notification sending process...');

      const { data: newMessage, error: dbError } = await supabase
        .from('notification_messages')
        .insert([{ 
          title_en: "🔔 Enhanced Notification Test", 
          title_ar: "🔔 اختبار الإشعارات المحسنة",
          body_en: "This is a test of our enhanced notification system. Thank you for helping us improve!",
          body_ar: "هذا اختبار لنظام الإشعارات المحسن. شكراً لمساعدتنا في التحسين!",
          stats: {
            total_sent: 0,
            delivered: 0,
            user_actions: 0
          }
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Created notification message:', newMessage);

      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('status', 'active')
        .lt('error_count', 3)
        .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (subError) {
        console.error('Subscription fetch error:', subError);
        throw subError;
      }

      if (!subscriptions?.length) {
        console.log('No active subscriptions found');
        toast.info("No active subscriptions found");
        return;
      }

      console.log(`Found ${subscriptions.length} active subscriptions`);

      const { error: pushError, data: pushResponse } = await supabase.functions.invoke<PushNotificationResponse>('push-notification', {
        body: {
          subscriptions: subscriptions,
          message: {
            title_en: "🔔 Enhanced Notification Test",
            title_ar: "🔔 اختبار الإشعارات المحسنة",
            body_en: "This is a test of our enhanced notification system. Thank you for helping us improve!",
            body_ar: "هذا اختبار لنظام الإشعارات المحسن. شكراً لمساعدتنا في التحسين!",
            message_id: newMessage.id,
            url: window.location.origin + '/offers'
          }
        }
      });

      if (pushError) {
        console.error('Push notification error:', pushError);
        throw pushError;
      }

      console.log('Push notification response:', pushResponse);

      if (pushResponse?.success) {
        toast.success(`Successfully sent to ${pushResponse.results.successful} devices`);
        
        if (pushResponse.results.platformStats) {
          Object.entries(pushResponse.results.platformStats).forEach(([platform, stats]) => {
            console.log(`Platform ${platform}: ${stats.success} successful, ${stats.failed} failed`);
          });
        }
        
        if (pushResponse.results.failed > 0) {
          console.warn(`Failed to send to ${pushResponse.results.failed} devices`);
          toast.warning(`Failed to send to ${pushResponse.results.failed} devices`);
        }
      }
      
      setTitleEn("");
      setTitleAr("");
      setBodyEn("");
      setBodyAr("");

      await onMessageSent();
      
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error("Error sending notification");
    } finally {
      setSending(false);
    }
  };

  const EmojiPickerButton = ({ inputId }: { inputId: typeof activeInput }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={() => setActiveInput(inputId)}
        >
          <SmilePlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Picker 
          data={data} 
          onEmojiSelect={handleEmojiSelect}
          theme="light"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title (English)</label>
          <div className="flex gap-2">
            <Input
              value={title_en}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Enter title in English"
            />
            <EmojiPickerButton inputId="title_en" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Title (Arabic)</label>
          <div className="flex gap-2">
            <Input
              value={title_ar}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder="أدخل العنوان بالعربية"
              className="text-right"
              dir="rtl"
            />
            <EmojiPickerButton inputId="title_ar" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Message (English)</label>
          <div className="flex gap-2">
            <Textarea
              value={body_en}
              onChange={(e) => setBodyEn(e.target.value)}
              placeholder="Enter message in English"
              rows={4}
            />
            <EmojiPickerButton inputId="body_en" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Message (Arabic)</label>
          <div className="flex gap-2">
            <Textarea
              value={body_ar}
              onChange={(e) => setBodyAr(e.target.value)}
              placeholder="أدخل الرسالة بالعربية"
              className="text-right"
              dir="rtl"
              rows={4}
            />
            <EmojiPickerButton inputId="body_ar" />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSendNotification} 
        disabled={sending || !title_en || !title_ar || !body_en || !body_ar}
        className="w-full"
      >
        {sending ? "Sending..." : "Send Notification"}
      </Button>
    </div>
  );
};
