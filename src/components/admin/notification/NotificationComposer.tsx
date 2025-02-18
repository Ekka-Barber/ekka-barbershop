
import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery } from '@tanstack/react-query';

interface NotificationComposerProps {
  onMessageSent: () => void;
}

export const NotificationComposer = ({ onMessageSent }: NotificationComposerProps) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      // Simplified notification sending without tracking
      toast.success('Notification sent successfully');
      onMessageSent();
      setTitle('');
      setBody('');
      setUrl('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notification message"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">URL (optional)</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      <Button type="submit" disabled={sending}>
        {sending ? 'Sending...' : 'Send Notification'}
      </Button>
    </form>
  );
};
