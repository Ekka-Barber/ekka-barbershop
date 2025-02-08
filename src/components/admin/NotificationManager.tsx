import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus, BarChart3, BellRing, RefreshCw, Send, MessageCircle, UserX } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NotificationManager = () => {
  const [title_en, setTitleEn] = useState("");
  const [title_ar, setTitleAr] = useState("");
  const [body_en, setBodyEn] = useState("");
  const [body_ar, setBodyAr] = useState("");
  const [sending, setSending] = useState(false);
  const [activeInput, setActiveInput] = useState<'title_en' | 'title_ar' | 'body_en' | 'body_ar' | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    totalClicked: 0,
    totalReceived: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    fetchMessages();
    fetchAnalytics();
    
    // Subscribe to real-time updates for notification events
    const channel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_events'
        },
        () => {
          fetchMessages();
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('status', 'active');

      if (subError) throw subError;

      // Get notification events statistics
      const { data: events, error: eventsError } = await supabase
        .from('notification_events')
        .select('event_type, action');

      if (eventsError) throw eventsError;

      setAnalytics({
        totalSent: messages.length,
        totalClicked: events?.filter(e => e.event_type === 'clicked').length || 0,
        totalReceived: events?.filter(e => e.event_type === 'received').length || 0,
        activeSubscriptions: subscriptions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Error loading analytics");
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Error loading message history");
    } finally {
      setLoading(false);
    }
  };

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

  const handleResend = async (message: any) => {
    try {
      setSending(true);

      // Get all active and valid subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('status', 'active')
        .lt('error_count', 3)
        .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (subError) throw subError;

      // Send notification to each subscription
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
              message_id: message.id, // Include message ID for tracking
              url: window.location.origin + '/offers'
            }
          }
        });
      }) || []);

      toast.success("Notification resent successfully!");
    } catch (error) {
      console.error('Error resending notification:', error);
      toast.error("Error resending notification");
    } finally {
      setSending(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      setSending(true);

      // First, save the notification message to the database
      const { data: newMessage, error: dbError } = await supabase
        .from('notification_messages')
        .insert([{ 
          title_en, 
          title_ar, 
          body_en, 
          body_ar,
          stats: {
            total_sent: 0,
            delivered: 0,
            user_actions: 0
          }
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // Get all active and valid subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('status', 'active')
        .lt('error_count', 3)
        .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (subError) throw subError;

      // Send notification to each subscription
      await Promise.all(subscriptions?.map(async (subscription) => {
        const { endpoint, p256dh, auth } = subscription;
        
        await supabase.functions.invoke('push-notification', {
          body: {
            subscription: {
              endpoint,
              keys: { p256dh, auth }
            },
            message: {
              title_en,
              title_ar,
              body_en,
              body_ar,
              message_id: newMessage.id, // Include message ID for tracking
              url: window.location.origin + '/offers'
            }
          }
        });
      }) || []);

      toast.success("Notification sent successfully!");
      
      // Clear form
      setTitleEn("");
      setTitleAr("");
      setBodyEn("");
      setBodyAr("");

      // Refresh messages after sending
      await fetchMessages();
      
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
    <Tabs defaultValue="compose" className="space-y-8">
      <TabsList>
        <TabsTrigger value="compose" className="flex items-center gap-2">
          <BellRing className="h-4 w-4" />
          Compose
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="compose" className="space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Message History</h2>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground">No messages sent yet</p>
          ) : (
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
          )}
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Active push notification subscribers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSent}</div>
              <p className="text-xs text-muted-foreground">Total notifications sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReceived}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClicked}</div>
              <p className="text-xs text-muted-foreground">User interactions</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default NotificationManager;
