import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { ExportDialog } from "./ExportDialog";

interface ReportHeaderProps {
  title: string;
  reportName: string;
}

export function ReportHeader({ title, reportName }: ReportHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select defaultValue="this-month">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range...</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon" onClick={() => setExportOpen(true)} title="Export Report">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <ExportDialog 
        open={exportOpen} 
        onOpenChange={setExportOpen} 
        reportName={reportName} 
      />
    </div>
  );
}
