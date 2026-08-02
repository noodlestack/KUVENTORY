import { Expense } from "@/types/expenses";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";

interface ExpenseTableProps {
  expenses: Expense[];
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
}

export function ExpenseTable({ expenses, onView, onEdit }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
        <p className="text-lg font-medium">No expenses recorded</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or record a new expense.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(new Date(dateStr));

  return (
    <div className="mt-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expense No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(exp)}>
                <TableCell className="font-mono text-sm font-medium">{exp.expenseNo}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(exp.expenseDate)}</TableCell>
                <TableCell>{exp.categoryName}</TableCell>
                <TableCell>{exp.supplier || "-"}</TableCell>
                <TableCell className="truncate max-w-[200px]">{exp.description}</TableCell>
                <TableCell>{exp.paymentMethod}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(exp.amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={exp.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(exp)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(exp)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {expenses.map((exp) => (
          <Card key={exp.id} className="cursor-pointer hover:border-primary/50" onClick={() => onView(exp)}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{exp.categoryName}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{exp.expenseNo}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(exp)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(exp)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-sm line-clamp-1">{exp.description}</p>
              <div className="text-xs text-muted-foreground mt-1">
                {exp.paymentMethod} &bull; {exp.supplier || "No Supplier"}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(exp.expenseDate)} &bull; {exp.recordedBy}
              </div>
              <div className="flex justify-between items-center mt-2">
                <StatusBadge status={exp.status} />
                <span className="font-medium text-lg">{formatCurrency(exp.amount)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
