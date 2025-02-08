
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, MessageCircle, UserX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface NotificationHistoryProps {
  messages: any[];
  loading: boolean;
  onMessageResent: () => Promise<void>;
}

export const NotificationHistory = ({ messages, loading, onMessageResent }: NotificationHistoryProps) => {
  const [sending, setSending] = useState(false);

  const handleResend = async (message: any) => {
    try {
      setSending(true);

      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('status', 'active')
        .lt('error_count', 3)
        .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (subError) throw subError;

      await Promise.all(subscriptions?.map(async (subscription) => {
        const { endpoint, p256dh, auth } = subscription;
        
        await supabase.functions.invoke('push-notification', {
          body: {
            subscription: {
              endpoint,
              keys: { p256dh, auth }
            },
            message: {
              ...message,
              message_id: message.id,
              url: window.location.origin + '/offers'
            }
          }
        });
      }) || []);

      toast.success("Notification resent successfully!");
      await onMessageResent();
    } catch (error) {
      console.error('Error resending notification:', error);
      toast.error("Error resending notification");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading messages...</p>;
  }

  if (messages.length === 0) {
    return <p className="text-center text-muted-foreground">No messages sent yet</p>;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-x-4 flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleResend(message)}
                      disabled={sending}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resend notification</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {message.stats?.total_sent || 0}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total notifications sent</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {message.stats?.delivered || 0}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Successfully delivered</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {message.stats?.user_actions || 0}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>User interactions</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), 'PPpp')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">{message.title_en}</h3>
              <p className="text-sm text-muted-foreground">{message.body_en}</p>
            </div>
            <div className="text-right">
              <h3 className="font-medium" dir="rtl">{message.title_ar}</h3>
              <p className="text-sm text-muted-foreground" dir="rtl">{message.body_ar}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
