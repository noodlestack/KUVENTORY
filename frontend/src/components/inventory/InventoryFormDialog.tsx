import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem, InventoryFormData } from "@/types/inventory";

interface Category {
  id: string;
  name: string;
}

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  categories: Category[];
  onSubmit: (data: InventoryFormData) => Promise<void>;
}

export function InventoryFormDialog({ open, onOpenChange, item, categories, onSubmit }: InventoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InventoryFormData>({
    sku: "",
    name: "",
    category_id: "",
    supplier_name: "",
    unit: "",
    cost: 0,
    current_stock: 0,
    minimum_stock: 0,
    notes: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        category_id: item.category_id,
        supplier_name: item.supplier_name || "",
        unit: item.unit || "",
        cost: item.cost,
        current_stock: item.current_stock, // We disable editing this for existing items
        minimum_stock: item.minimum_stock,
        notes: item.notes || "",
      });
    } else {
      setFormData({
        sku: `SKU-${Date.now().toString().slice(-6)}`, // simple generator
        name: "",
        category_id: "",
        supplier_name: "",
        unit: "",
        cost: 0,
        current_stock: 0,
        minimum_stock: 0,
        notes: "",
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{item ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
            <DialogDescription>
              {item ? 'Update the details for this item.' : 'Enter the details for the new inventory item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU / Item Code</Label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category_id">Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier_name">Supplier</Label>
                <Input id="supplier_name" name="supplier_name" value={formData.supplier_name} onChange={handleChange} placeholder="e.g. ABC Trading" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit of Measure</Label>
                <Input id="unit" name="unit" value={formData.unit} onChange={handleChange} placeholder="e.g. kg, pcs, boxes" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Cost Price</Label>
                <Input id="cost" name="cost" type="number" step="0.01" min="0" value={formData.cost} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minimum_stock">Minimum Stock Level</Label>
                <Input id="minimum_stock" name="minimum_stock" type="number" min="0" value={formData.minimum_stock} onChange={handleChange} required />
              </div>
              {!item && (
                <div className="grid gap-2">
                  <Label htmlFor="current_stock">Initial Stock</Label>
                  <Input id="current_stock" name="current_stock" type="number" min="0" value={formData.current_stock} onChange={handleChange} required />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
