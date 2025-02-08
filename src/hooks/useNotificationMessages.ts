
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationMessage, NotificationStats } from "@/types/notifications";

export const useNotificationMessages = () => {
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure stats is properly typed
      const transformedData: NotificationMessage[] = (data || []).map(message => ({
        id: message.id,
        title_en: message.title_en,
        title_ar: message.title_ar,
        body_en: message.body_en,
        body_ar: message.body_ar,
        created_at: message.created_at,
        stats: message.stats as unknown as NotificationStats ?? {
          total_sent: 0,
          delivered: 0,
          user_actions: 0
        }
      }));

      setMessages(transformedData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Error loading message history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time updates for both tables
    const messagesChannel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_messages'
        },
        () => {
          console.log('Notification messages updated, refreshing...');
          fetchMessages();
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('notification-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_events'
        },
        () => {
          console.log('New notification event, refreshing messages...');
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  return { messages, loading, setMessages, fetchMessages };
};
