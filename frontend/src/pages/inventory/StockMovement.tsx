import { useStockMovements } from "@/hooks/inventory/useStockMovements";
import { MovementTable } from "@/components/inventory/MovementTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function StockMovement() {
  const { movements, isLoading } = useStockMovements();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading movements...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Stock Movement History</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search movements..." className="pl-8" />
        </div>
      </div>
      
      <MovementTable movements={movements} />
    </div>
  );
}
