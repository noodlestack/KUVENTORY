import { useEffect } from "react";
import { ArchiveRestore, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/inventory/useInventory";
import { toast } from "sonner";

export function ArchivedInventory() {
  const { archivedItems, isLoadingArchived, refreshArchived, restoreItem } = useInventory();

  useEffect(() => {
    refreshArchived();
  }, [refreshArchived]);

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Restore "${name}" back to active inventory?`)) return;
    try {
      await restoreItem(id);
      toast.success(`"${name}" has been restored to active inventory.`);
      // Refresh archived list after restore
      await refreshArchived();
    } catch {
      // Error already shown by hook
    }
  };

  if (isLoadingArchived) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading archived items...
      </div>
    );
  }

  if (archivedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-md border-dashed bg-card">
        <ArchiveRestore className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
        <p className="text-lg font-medium">No Archived Items</p>
        <p className="text-sm text-muted-foreground mt-1">
          Items that are archived will appear here and can be restored.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Archived Supplies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {archivedItems.length} archived item{archivedItems.length !== 1 ? 's' : ''}. Restore to return to active inventory.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Item</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Code</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Category</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Unit</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Supplier</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Storage</th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Status</th>
              <th className="text-right px-4 py-3 font-medium whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {archivedItems.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.name}</div>
                  {item.notes && (
                    <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{item.notes}</div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {item.itemCode}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{item.categoryName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.unit || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.supplier || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.storageLocation || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">Archived</Badge>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => handleRestore(item.id, item.name)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
