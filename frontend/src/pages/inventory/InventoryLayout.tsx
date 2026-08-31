import { InventoryList } from "./InventoryList";

export function InventoryLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Manage raw materials, stock levels, and historical movements.</p>
      </div>

      <div className="mt-6">
        <InventoryList />
      </div>
    </div>
  );
}
