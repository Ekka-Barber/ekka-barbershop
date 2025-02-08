
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
      
      // Convert the raw data to match NotificationMessage type
      const typedMessages: NotificationMessage[] = data?.map(msg => {
        const statsData = msg.stats as Record<string, number>;
        
        return {
          id: msg.id,
          title_en: msg.title_en,
          title_ar: msg.title_ar,
          body_en: msg.body_en,
          body_ar: msg.body_ar,
          created_at: msg.created_at,
          stats: {
            total_sent: statsData?.total_sent || 0,
            delivered: statsData?.delivered || 0,
            user_actions: statsData?.user_actions || 0
          } as NotificationStats
        };
      }) || [];
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Error loading message history");
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, setMessages, fetchMessages };
};

