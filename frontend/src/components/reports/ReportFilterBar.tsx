import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, subDays } from "date-fns";

export type DateRangeFilter = "all_time" | "today" | "yesterday" | "this_week" | "last_7_days" | "this_month" | "this_year" | "custom";

export interface ReportFilterState {
  startDate?: Date;
  endDate?: Date;
  dateRangePreset: DateRangeFilter;
}

interface ReportFilterBarProps {
  onFilterChange: (filters: ReportFilterState) => void;
  isLoading?: boolean;
}

export function ReportFilterBar({ onFilterChange, isLoading }: ReportFilterBarProps) {
  const [dateRangePreset, setDateRangePreset] = useState<DateRangeFilter>("this_month");

  useEffect(() => {
    let startDate: Date | undefined;
    let endDate: Date | undefined = endOfDay(new Date());

    const now = new Date();

    switch (dateRangePreset) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "yesterday":
        startDate = startOfDay(subDays(now, 1));
        endDate = endOfDay(subDays(now, 1));
        break;
      case "this_week":
        startDate = startOfWeek(now);
        break;
      case "last_7_days":
        startDate = startOfDay(subDays(now, 7));
        break;
      case "this_month":
        startDate = startOfMonth(now);
        break;
      case "this_year":
        startDate = startOfYear(now);
        break;
      case "all_time":
        startDate = undefined;
        endDate = undefined;
        break;
      case "custom":
        // Fallback or leave undefined for now, could add input[type="date"]
        startDate = undefined;
        endDate = undefined;
        break;
    }

    onFilterChange({ startDate, endDate, dateRangePreset });
  }, [dateRangePreset, onFilterChange]);

  return (
    <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Date Range:</span>
        <Select 
          value={dateRangePreset} 
          onValueChange={(val) => setDateRangePreset(val as DateRangeFilter)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1" />
      
      <Button variant="outline" size="sm" onClick={() => setDateRangePreset("this_month")} disabled={isLoading}>
        Reset Filters
      </Button>
    </div>
  );
}
