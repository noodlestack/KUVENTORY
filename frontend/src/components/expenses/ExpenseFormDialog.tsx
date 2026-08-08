import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { calculateDiscount } from "@/utils/discountUtils";
import { ExpenseFormData, ExpenseCategory, Expense } from "@/types/expenses";
import { useDiscounts } from "@/hooks/discounts/useDiscounts";
import { DiscountSummaryRibbon } from "@/components/discounts/DiscountSummaryRibbon";

const expenseSchema = z.object({
  expenseDate: z.string().min(1, "Date is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(3, "Description must be at least 3 characters").max(200, "Description too long"),
  originalAmount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["Cash", "GCash", "Bank Transfer", "Check"]),
  referenceNo: z.string().optional(),
  supplier: z.string().optional(),
  remarks: z.string().max(300, "Remarks cannot exceed 300 characters").optional(),
  status: z.enum(["Paid", "Pending", "Cancelled"]),
  hasDiscount: z.boolean().optional(),
  discountId: z.string().optional(),
});

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategory[];
  expense?: Expense | null;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
}

export function ExpenseFormDialog({ open, onOpenChange, categories, expense, onSubmit }: ExpenseFormDialogProps) {
  const { discounts } = useDiscounts();

  const form = useForm<ExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      expenseDate: new Date().toISOString().split("T")[0],
      categoryId: "",
      description: "",
      originalAmount: 0,
      paymentMethod: "Cash",
      referenceNo: "",
      supplier: "",
      remarks: "",
      status: "Paid",
      hasDiscount: false,
      discountId: "",
    },
  });

  const formValues = form.watch();
  
  const selectedDiscount = formValues.hasDiscount ? discounts.find(d => d.id === formValues.discountId) : undefined;
  
  const { calculatedDiscount, finalAmount } = calculateDiscount(
    formValues.originalAmount || 0,
    selectedDiscount
  );

  useEffect(() => {
    if (open) {
      if (expense) {
        form.reset({
          expenseDate: expense.expenseDate.split("T")[0],
          categoryId: expense.categoryId,
          description: expense.description,
          originalAmount: expense.originalAmount,
          paymentMethod: expense.paymentMethod || "Cash",
          referenceNo: expense.referenceNo || "",
          supplier: expense.supplier || "",
          remarks: expense.remarks || "",
          status: expense.status,
          hasDiscount: !!expense.discountId,
          discountId: expense.discountId || "",
        });
      } else {
        form.reset({
          expenseDate: new Date().toISOString().split("T")[0],
          categoryId: "",
          description: "",
          originalAmount: 0,
          paymentMethod: "Cash",
          referenceNo: "",
          supplier: "",
          remarks: "",
          status: "Paid",
          hasDiscount: false,
          discountId: "",
        });
      }
    }
  }, [open, expense, form]);

  const handleSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const activeCategories = categories.filter(c => c.isActive || c.id === expense?.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle>{expense ? "Edit Expense" : "Record Expense"}</DialogTitle>
              <DialogDescription>
                {expense ? "Update the details of this expense record." : "Log a new operational expense."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Electricity Bill - Meralco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier/Payee</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Supplier Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Discount Section */}
              <div className="border rounded-md p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="hasDiscount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-accent/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Apply Discount</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable to apply a discount to this expense.
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("hasDiscount") && (
                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="discountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Discount</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {discounts.filter(d => d.isActive).map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.name} ({d.percentage ? `${d.percentage}%` : `₱${d.amount}`})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              {formValues.hasDiscount && selectedDiscount ? (
                <DiscountSummaryRibbon
                  discountName={selectedDiscount.name}
                  percentage={selectedDiscount.percentage}
                  amount={selectedDiscount.amount}
                  originalAmount={formValues.originalAmount || 0}
                  discountAmount={calculatedDiscount}
                  finalAmount={finalAmount}
                />
              ) : (
                <div className="bg-muted p-4 rounded-lg flex flex-col items-end space-y-2">
                  <div className="flex justify-between w-full sm:w-64 font-bold text-lg pt-2 border-t">
                    <span>Final Expense:</span>
                    <span>₱{finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="GCash">GCash</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referenceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. REF-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="px-6 py-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : expense ? "Update Expense" : "Record Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
