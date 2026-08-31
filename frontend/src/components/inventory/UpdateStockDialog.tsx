import { useState } from "react";
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
import { InventoryItem, StockUpdateFormData, MovementType } from "@/types/inventory";

interface UpdateStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
  onSubmit: (data: StockUpdateFormData) => Promise<void>;
}

export function UpdateStockDialog({ open, onOpenChange, item, onSubmit }: UpdateStockDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StockUpdateFormData>({
    movement_type: "ADD",
    quantity: 0,
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        movement_type: "ADD",
        quantity: 0,
        reason: "",
      });
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const newStockPreview = () => {
    const qty = Number(formData.quantity) || 0;
    if (formData.movement_type === "ADD") return item.current_stock + qty;
    if (formData.movement_type === "REMOVE") return item.current_stock - qty;
    if (formData.movement_type === "ADJUST") return qty;
    return item.current_stock;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Stock for {item.name}</DialogTitle>
            <DialogDescription>
              Current Stock: <span className="font-bold">{item.current_stock}</span> {item.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="movement_type">Action</Label>
              <Select 
                value={formData.movement_type} 
                onValueChange={(val: MovementType) => setFormData(prev => ({ ...prev, movement_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADD">Add Stock</SelectItem>
                  <SelectItem value="REMOVE">Remove Stock</SelectItem>
                  <SelectItem value="ADJUST">Manual Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="0.01" 
                step="0.01" 
                value={formData.quantity || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))} 
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input 
                id="reason" 
                value={formData.reason} 
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))} 
                placeholder="e.g. Replenishment, Damage, Count correction" 
              />
            </div>

            <div className="rounded-md bg-muted p-3 mt-2 flex justify-between items-center">
              <span className="text-sm font-medium">New Stock Preview:</span>
              <span className={`text-lg font-bold ${newStockPreview() < 0 ? 'text-destructive' : ''}`}>
                {newStockPreview()} {item.unit}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || newStockPreview() < 0 || formData.quantity <= 0}>
              {isSubmitting ? 'Updating...' : 'Confirm Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
