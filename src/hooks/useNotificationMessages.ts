
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationMessage } from '@/types/notifications';

export const useNotificationMessages = () => {
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure correct typing
      const transformedMessages: NotificationMessage[] = (data || []).map(msg => ({
        id: msg.id,
        title: msg.title,
        body: msg.body,
        url: msg.url || undefined,
        created_at: msg.created_at,
        data: msg.data as Record<string, any> || undefined
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    fetchMessages,
  };
};
