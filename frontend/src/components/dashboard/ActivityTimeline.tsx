import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "@/types/dashboard";
import { Package, Truck, DollarSign, Users, RefreshCw } from "lucide-react";

interface ActivityTimelineProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "Inventory": return <Package className="h-4 w-4 text-info" />;
    case "Purchase": return <Truck className="h-4 w-4 text-warning" />;
    case "Sale": return <DollarSign className="h-4 w-4 text-success" />;
    case "Supplier": return <Users className="h-4 w-4 text-primary" />;
    case "Expense": return <RefreshCw className="h-4 w-4 text-destructive" />;
  }
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">No recent activities</div>
        ) : (
          <ScrollArea className="h-[300px] w-full px-6 pb-6">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Icon */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded bg-card border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-foreground">{activity.type}</span>
                      <time className="text-xs text-muted-foreground">{activity.timestamp}</time>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
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
