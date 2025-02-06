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

const NotificationManager = () => {
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

      // First, save the notification message to the database
      const { error: dbError } = await supabase
        .from('notification_messages')
        .insert([{ title_en, title_ar, body_en, body_ar }]);

      if (dbError) throw dbError;

      // Get all active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('status', 'active');

      if (subError) throw subError;

      // Send notification to each subscription
      await Promise.all(subscriptions.map(async (subscription) => {
        const { endpoint, p256dh, auth } = subscription;
        
        await supabase.functions.invoke('push-notification', {
          body: {
            subscription: {
              endpoint,
              keys: { p256dh, auth }
            },
            message: JSON.stringify({
              title_en,
              title_ar,
              body_en,
              body_ar
            })
          }
        });
      }));

      toast.success("Notification sent successfully!");
      
      // Clear form
      setTitleEn("");
      setTitleAr("");
      setBodyEn("");
      setBodyAr("");
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
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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

export default NotificationManager;