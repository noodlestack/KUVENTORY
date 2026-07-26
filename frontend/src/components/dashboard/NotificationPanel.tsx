import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from "@/types/dashboard";
import { BellRing, AlertTriangle, Info, Clock } from "lucide-react";
import { cn } from "@/utils/utils";

interface NotificationPanelProps {
  notifications: Notification[];
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "Alert": return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "Warning": return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "Maintenance": return <Clock className="h-5 w-5 text-muted-foreground" />;
    case "Reminder": return <Info className="h-5 w-5 text-info" />;
  }
};

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Notifications
        </CardTitle>
        <Badge variant="secondary" className="font-normal">
          {notifications.filter(n => !n.isRead).length} New
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">No new notifications</div>
        ) : (
          <ScrollArea className="h-[300px] w-full px-6 pb-6">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "flex gap-4 p-3 rounded-lg border",
                    notification.isRead ? "bg-background border-transparent" : "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      {!notification.isRead && <span className="flex h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
