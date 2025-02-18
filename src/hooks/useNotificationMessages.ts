
import { useState } from 'react';
import { NotificationMessage } from '@/types/notifications';

export const useNotificationMessages = () => {
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      setMessages([]);
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
