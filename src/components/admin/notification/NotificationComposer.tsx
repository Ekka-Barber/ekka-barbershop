
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ComposerInput } from "./composer/ComposerInput";

interface PushNotificationResponse {
  success: boolean;
  results: {
    successful: number;
    failed: number;
    platformStats?: Record<string, { success: number; failed: number }>;
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
      console.log('Starting notification sending process with:', {
        title_en,
        title_ar,
        body_en,
        body_ar
      });

      const { data: newMessage, error: dbError } = await supabase
        .from('notification_messages')
        .insert([{ 
          title_en, 
          title_ar,
          body_en,
          body_ar,
          stats: {
            total_sent: 0,
            delivered: 0,
            user_actions: 0
          }
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('status', 'active')
        .lt('error_count', 3)
        .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (subError) throw subError;

      if (!subscriptions?.length) {
        toast.info("No active subscriptions found");
        return;
      }

      const { error: pushError, data: pushResponse } = await supabase.functions.invoke<PushNotificationResponse>('push-notification', {
        body: {
          subscriptions: subscriptions,
          message: {
            title_en,
            title_ar,
            body_en,
            body_ar,
            message_id: newMessage.id,
            url: window.location.origin + '/offers'
          }
        }
      });

      if (pushError) throw pushError;

      if (pushResponse?.success) {
        toast.success(`Successfully sent to ${pushResponse.results.successful} devices`);
        
        if (pushResponse.results.failed > 0) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComposerInput
          label="Title (English)"
          value={title_en}
          onChange={setTitleEn}
          placeholder="Enter title in English"
          inputId="title_en"
          onEmojiSelect={handleEmojiSelect}
          onEmojiPickerOpen={setActiveInput}
        />
        <ComposerInput
          label="Title (Arabic)"
          value={title_ar}
          onChange={setTitleAr}
          placeholder="أدخل العنوان بالعربية"
          inputId="title_ar"
          isRtl
          onEmojiSelect={handleEmojiSelect}
          onEmojiPickerOpen={setActiveInput}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComposerInput
          label="Message (English)"
          value={body_en}
          onChange={setBodyEn}
          placeholder="Enter message in English"
          inputId="body_en"
          isTextArea
          onEmojiSelect={handleEmojiSelect}
          onEmojiPickerOpen={setActiveInput}
        />
        <ComposerInput
          label="Message (Arabic)"
          value={body_ar}
          onChange={setBodyAr}
          placeholder="أدخل الرسالة بالعربية"
          inputId="body_ar"
          isTextArea
          isRtl
          onEmojiSelect={handleEmojiSelect}
          onEmojiPickerOpen={setActiveInput}
        />
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
