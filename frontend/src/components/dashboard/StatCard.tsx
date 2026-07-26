import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/utils";

import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, icon, trend, trendLabel, className, href, onClick }: StatCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href) navigate(href);
    else if (onClick) onClick();
  };

  const isClickable = !!href || !!onClick;
  return (
    <Card 
      className={cn(
        "transition-shadow", 
        isClickable ? "hover:shadow-md cursor-pointer hover:border-primary/50" : "",
        className
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className="text-xs mt-1">
            <span className={cn("font-medium", trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground")}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
            {" "}
            <span className="text-muted-foreground">{trendLabel}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
