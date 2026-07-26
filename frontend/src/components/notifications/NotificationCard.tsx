import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Notification } from "@/types/notifications";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { 
  Package, 
  CreditCard, 
  ShoppingCart, 
  Settings, 
  ShieldAlert,
  User,
  Info
} from "lucide-react";

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case "Inventory": return <Package className="h-4 w-4" />;
    case "Sales": return <CreditCard className="h-4 w-4" />;
    case "Purchases": return <ShoppingCart className="h-4 w-4" />;
    case "Expenses": return <CreditCard className="h-4 w-4" />;
    case "System": return <Settings className="h-4 w-4" />;
    case "Security": return <ShieldAlert className="h-4 w-4 text-destructive" />;
    case "Account": return <User className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case "Security": return "bg-destructive/10 text-destructive";
    case "Inventory": return "bg-orange-500/10 text-orange-500";
    case "System": return "bg-blue-500/10 text-blue-500";
    default: return "bg-primary/10 text-primary";
  }
};

export function NotificationCard({ notification, onMarkRead, onDelete, onClick }: NotificationCardProps) {
  const content = (
    <div className="flex gap-4">
      <div className={cn(
        "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        getBadgeColor(notification.type)
      )}>
        {getIcon(notification.type)}
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm font-medium leading-none",
            !notification.isRead && "font-bold text-foreground"
          )}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        
        <div className="flex items-center gap-2 pt-2">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider", getBadgeColor(notification.type))}>
            {notification.type}
          </span>
          {notification.priority === "critical" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-destructive text-destructive-foreground">
              Critical
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "group relative flex flex-col gap-2 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent",
      !notification.isRead ? "bg-background shadow-sm" : "bg-muted/40"
    )}>
      {notification.actionUrl ? (
        <Link to={notification.actionUrl} onClick={onClick} className="absolute inset-0 z-10">
          <span className="sr-only">View details</span>
        </Link>
      ) : (
        <div onClick={onClick} className="absolute inset-0 z-10 cursor-pointer" />
      )}
      
      {content}

      <div className="absolute right-4 top-4 z-20 flex opacity-0 transition-opacity group-hover:opacity-100 bg-background/80 backdrop-blur-sm rounded-md shadow-sm border p-0.5">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification.id);
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
