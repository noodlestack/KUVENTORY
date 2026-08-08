import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Supplier, SupplierFormData } from "@/types/suppliers";
import { useDiscounts } from "@/hooks/discounts/useDiscounts";

const supplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  contactPerson: z.string().min(2, "Contact Person is required"),
  phoneNumber: z.string().min(5, "Valid phone number is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
  status: z.enum(["Active", "Inactive", "Blacklisted"]),
  hasDefaultDiscount: z.boolean().optional(),
  defaultDiscountId: z.string().optional(),
});

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSubmit: (data: SupplierFormData) => Promise<void>;
}

export function SupplierFormDialog({ open, onOpenChange, supplier, onSubmit }: SupplierFormDialogProps) {
  const isEditing = !!supplier;
  const { discounts } = useDiscounts();

  const form = useForm<SupplierFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      name: "",
      contactPerson: "",
      phoneNumber: "",
      email: "",
      address: "",
      notes: "",
      status: "Active",
      hasDefaultDiscount: false,
      defaultDiscountId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (supplier) {
        form.reset({
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          phoneNumber: supplier.phoneNumber,
          email: supplier.email,
          address: supplier.address,
          notes: supplier.notes || "",
          status: supplier.status,
          hasDefaultDiscount: supplier.hasDefaultDiscount || false,
          defaultDiscountId: supplier.defaultDiscountId || "",
        });
      } else {
        form.reset({
          name: "",
          contactPerson: "",
          phoneNumber: "",
          email: "",
          address: "",
          notes: "",
          status: "Active",
          hasDefaultDiscount: false,
          defaultDiscountId: "",
        });
      }
    }
  }, [open, supplier, form]);

  const handleSubmit = async (data: SupplierFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle>{isEditing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Modify the details of an existing supplier." : "Register a new vendor in the system."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Global Beans Inc." {...field} />
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
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Blacklisted">Blacklisted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Alice Johnson" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., contact@supplier.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes & Remarks</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional remarks..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount Section */}
              <div className="border rounded-md p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="hasDefaultDiscount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-accent/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Apply Default Discount</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable default discount rules for purchases from this supplier.
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("hasDefaultDiscount") && (
                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="defaultDiscountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Default Discount</FormLabel>
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
            </div>

            <DialogFooter className="px-6 py-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
