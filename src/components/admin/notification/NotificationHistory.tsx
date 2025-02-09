
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationMessage } from "@/types/notifications";
import { formatDistanceToNow } from "date-fns";

interface NotificationHistoryProps {
  messages: NotificationMessage[];
  loading: boolean;
  onMessageResent: () => void;
}

export const NotificationHistory = ({
  messages,
  loading,
  onMessageResent,
}: NotificationHistoryProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!messages.length) {
    return (
      <Card className="p-4 text-center text-gray-500">
        No notifications sent yet
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{message.title}</h3>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{message.body}</p>
          {message.url && (
            <p className="text-sm text-blue-500 mb-2">
              <a href={message.url} target="_blank" rel="noopener noreferrer">
                {message.url}
              </a>
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onMessageResent}
          >
            Resend
          </Button>
        </Card>
      ))}
    </div>
  );
};
