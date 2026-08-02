import { useState } from "react";
import { useDiscounts } from "@/hooks/discounts/useDiscounts";
import { Discount, DiscountFormData } from "@/types/discounts";
import { DiscountFormDialog } from "@/components/discounts/DiscountFormDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function DiscountsLayout() {
  const { discounts, isLoading, createDiscount, updateDiscount, deleteDiscount } = useDiscounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

  const handleOpenDialog = (discount?: Discount) => {
    setSelectedDiscount(discount || null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: DiscountFormData) => {
    if (selectedDiscount) {
      await updateDiscount(selectedDiscount.id, data);
    } else {
      await createDiscount(data);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading discounts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery & Discounts</h1>
          <p className="text-muted-foreground">Manage senior, PWD, and promotional discounts.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Discount
        </Button>
      </div>

      <DiscountFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        discount={selectedDiscount}
        onSubmit={handleSubmit}
      />

      {discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-card mt-4">
          <p className="text-lg font-medium">No discounts recorded</p>
          <p className="text-sm text-muted-foreground mt-1">Create a new discount rule to get started.</p>
        </div>
      ) : (
        <div className="mt-4">
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.name}</TableCell>
                    <TableCell>{discount.type}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{discount.percentage}%</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">
                      {discount.requirements || "None"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={discount.isActive ? "default" : "secondary"}>
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(discount)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteDiscount(discount.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {discounts.map((discount) => (
              <Card key={discount.id}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{discount.name}</h3>
                      <p className="text-sm text-muted-foreground">{discount.type}</p>
                    </div>
                    <Badge variant={discount.isActive ? "default" : "secondary"}>
                      {discount.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Percentage</span>
                      <span className="font-bold text-xl text-primary">{discount.percentage}%</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenDialog(discount)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => deleteDiscount(discount.id)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
