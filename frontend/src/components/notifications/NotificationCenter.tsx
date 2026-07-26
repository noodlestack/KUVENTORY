import * as React from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationCard } from "./NotificationCard";

export function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = React.useState(false);

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const inventoryNotifications = notifications.filter(n => n.type === "Inventory");
  const systemNotifications = notifications.filter(n => n.type === "System" || n.type === "Security");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">View notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 mr-4 mt-2" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-normal">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={clearAll}
                title="Clear all notifications"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 py-2 border-b">
            <TabsList className="w-full grid grid-cols-4 h-8 bg-transparent p-0">
              <TabsTrigger 
                value="all" 
                className="text-xs data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-full"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="text-xs data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-full"
              >
                Unread
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="text-xs data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-full"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="text-xs data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-full"
              >
                System
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px]">
            <TabsContent value="all" className="m-0 p-4 pt-2">
              <div className="flex flex-col gap-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationCard 
                      key={n.id} 
                      notification={n} 
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={() => setIsOpen(false)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="unread" className="m-0 p-4 pt-2">
              <div className="flex flex-col gap-2">
                {unreadNotifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    You're all caught up!
                  </div>
                ) : (
                  unreadNotifications.map((n) => (
                    <NotificationCard 
                      key={n.id} 
                      notification={n} 
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={() => setIsOpen(false)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="m-0 p-4 pt-2">
              <div className="flex flex-col gap-2">
                {inventoryNotifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No inventory alerts
                  </div>
                ) : (
                  inventoryNotifications.map((n) => (
                    <NotificationCard 
                      key={n.id} 
                      notification={n} 
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={() => setIsOpen(false)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="system" className="m-0 p-4 pt-2">
              <div className="flex flex-col gap-2">
                {systemNotifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No system alerts
                  </div>
                ) : (
                  systemNotifications.map((n) => (
                    <NotificationCard 
                      key={n.id} 
                      notification={n} 
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={() => setIsOpen(false)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
