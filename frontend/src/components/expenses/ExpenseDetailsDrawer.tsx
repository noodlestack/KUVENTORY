import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Expense } from "@/types/expenses";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface ExpenseDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onEdit: (expense: Expense) => void;
}

export function ExpenseDetailsDrawer({ open, onOpenChange, expense, onEdit }: ExpenseDetailsDrawerProps) {
  if (!expense) return null;

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader className="mb-6 flex flex-row items-center justify-between">
          <div>
            <SheetTitle className="text-2xl">Expense Details</SheetTitle>
            <SheetDescription className="font-mono">{expense.expenseNo}</SheetDescription>
          </div>
          <Button variant="outline" size="icon" onClick={() => onEdit(expense)}>
            <Edit className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Amount</span>
            <span className="font-bold text-2xl text-primary">{formatCurrency(expense.amount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <StatusBadge status={expense.status} />
          </div>

            <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">General Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Category</span>
                <span className="font-medium">{expense.categoryName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Expense Date</span>
                <span className="font-medium">{formatDate(expense.expenseDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Payment Method</span>
                <span className="font-medium">{expense.paymentMethod}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Reference No.</span>
                <span className="font-medium">{expense.referenceNo || "None"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-1">Supplier / Payee</span>
                <span className="font-medium">{expense.supplier || "Not specified"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-1">Description</span>
                <span className="font-medium">{expense.description}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-1">Remarks</span>
                <span className="font-medium">{expense.remarks || "None"}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">System Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Recorded By</span>
                <span className="font-medium">{expense.recordedBy}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Created</span>
                <span className="font-medium">{formatDate(expense.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Last Updated</span>
                <span className="font-medium">{formatDate(expense.updatedAt)}</span>
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
