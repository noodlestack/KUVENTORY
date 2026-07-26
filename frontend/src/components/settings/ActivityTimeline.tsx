import { ActivityLog } from "@/types/settings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface ActivityTimelineProps {
  logs: ActivityLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground border rounded-md bg-muted/10">
        No activity logs found.
      </div>
    );
  }

  // Format date helper
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return format(date, "h:mm a");
  };

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const date = formatDate(log.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-8">
        {Object.entries(groupedLogs).map(([date, dayLogs]) => (
          <div key={date} className="relative">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 mb-4 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground">{date}</h3>
            </div>
            
            <div className="space-y-6">
              {dayLogs.map((log) => (
                <div key={log.id} className="relative pl-6 sm:pl-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-[-24px] before:w-px before:bg-border last:before:hidden">
                  <div className="absolute left-0 sm:left-1 top-1.5 h-[10px] w-[10px] rounded-full bg-primary/20 border-2 border-primary" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{log.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                          {log.module}
                        </span>
                        <span className="text-xs text-muted-foreground border-l pl-2">
                          by <span className="font-medium text-foreground">{log.user}</span>
                        </span>
                      </div>
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">
                      {formatTime(log.date)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
