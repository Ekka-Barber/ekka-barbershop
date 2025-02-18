
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationComposerProps {
  onMessageSent: () => void;
}

export const NotificationComposer = ({ onMessageSent }: NotificationComposerProps) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !body) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setSending(true);
      
      const { error } = await supabase
        .from('notification_events')
        .insert({
          title,
          body,
          url: url || null
        });

      if (error) throw error;
      
      toast.success("Notification sent successfully");
      setTitle("");
      setBody("");
      setUrl("");
      onMessageSent();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error("Error sending notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Notification Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
      </div>
      
      <div>
        <Input
          placeholder="URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      
      <Button type="submit" disabled={sending}>
        {sending ? "Sending..." : "Send Notification"}
      </Button>
    </form>
  );
};
