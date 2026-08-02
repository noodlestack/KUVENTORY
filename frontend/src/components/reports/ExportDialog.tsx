import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, Table as TableIcon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  exportData?: Record<string, unknown>[];
  exportColumns?: { header: string; dataKey: string }[];
}

export function ExportDialog({ open, onOpenChange, reportName, exportData, exportColumns }: ExportDialogProps) {
  const handleExport = (type: string) => {
    if (!exportData || !exportColumns || exportData.length === 0) {
      toast.error("No data available to export");
      onOpenChange(false);
      return;
    }

    try {
      if (type === "PDF") {
        const doc = new jsPDF();
        doc.text(reportName, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
        
        const head = [exportColumns.map(c => c.header)];
        const body = exportData.map(row => exportColumns.map(c => {
          const val = row[c.dataKey];
          return val !== undefined && val !== null ? val.toString() : "";
        }));
        
        autoTable(doc, {
          head,
          body,
          startY: 30,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });
        
        doc.save(`${reportName.replace(/\s+/g, '_')}.pdf`);
        toast.success("PDF exported successfully");
      } 
      else if (type === "Excel") {
        const mappedData = exportData.map(row => {
          const newRow: Record<string, unknown> = {};
          exportColumns.forEach(c => {
            newRow[c.header] = row[c.dataKey];
          });
          return newRow;
        });
        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `${reportName.replace(/\s+/g, '_')}.xlsx`);
        toast.success("Excel exported successfully");
      }
      else if (type === "CSV") {
        const headers = exportColumns.map(c => c.header).join(",");
        const rows = exportData.map(row => exportColumns.map(c => {
          let val = row[c.dataKey];
          if (val === null || val === undefined) val = "";
          if (typeof val === 'string' && val.includes(',')) {
            val = `"${val}"`;
          }
          return val;
        }).join(","));
        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reportName.replace(/\s+/g, '_')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported successfully");
      }
      else if (type === "Print") {
        window.print();
      }
    } catch (error) {
      toast.error(`Failed to export to ${type}`);
      console.error(error);
    }
    
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
