import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, Table as TableIcon } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
}

export function ExportDialog({ open, onOpenChange, reportName }: ExportDialogProps) {
  const handleExport = (type: string) => {
    // Mock export action
    console.log(`Exporting ${reportName} to ${type}...`);
    alert(`Mock: Exporting ${reportName} to ${type}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose a format to export the {reportName}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleExport("PDF")}>
            <FileText className="h-6 w-6 text-red-500" />
            PDF Document
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleExport("Excel")}>
            <TableIcon className="h-6 w-6 text-emerald-600" />
            Excel SpreadSheet
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleExport("CSV")}>
            <Download className="h-6 w-6 text-blue-500" />
            CSV Data
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleExport("Print")}>
            <Printer className="h-6 w-6 text-muted-foreground" />
            Print Directly
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
