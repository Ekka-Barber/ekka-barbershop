
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
        // Ensure status is one of the allowed values
        const validStatus = (msg.status === 'draft' || msg.status === 'sent' || msg.status === 'failed') 
          ? msg.status 
          : 'draft';

        // Parse stats object with type safety
        const statsObj = msg.stats as Record<string, number> | null;
        
        return {
          id: msg.id,
          title_en: msg.title_en,
          title_ar: msg.title_ar,
          body_en: msg.body_en,
          body_ar: msg.body_ar,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          status: validStatus,
          scheduled_for: msg.scheduled_for,
          url: msg.url,
          icon: msg.icon,
          stats: {
            total_sent: Number(statsObj?.total_sent || 0),
            delivered: Number(statsObj?.delivered || 0),
            user_actions: Number(statsObj?.user_actions || 0)
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

