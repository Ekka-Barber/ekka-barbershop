
import { useState } from "react";
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
        stats: {
          total_sent: ((message.stats as unknown) as { total_sent?: number })?.total_sent || 0,
          delivered: ((message.stats as unknown) as { delivered?: number })?.delivered || 0,
          user_actions: ((message.stats as unknown) as { user_actions?: number })?.user_actions || 0
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

  return { messages, loading, setMessages, fetchMessages };
};
