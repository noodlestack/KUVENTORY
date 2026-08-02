import { InventoryItem } from "@/types/inventory";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Eye, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface InventoryTableProps {
  items: InventoryItem[];
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onView, onEdit }: InventoryTableProps) {
  
  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateStr));

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "itemCode",
      header: "Item Code",
      cell: ({ row }) => <div className="font-mono text-sm text-muted-foreground">{row.getValue("itemCode")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8 data-[state=open]:bg-accent"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "categoryName",
      header: "Category",
    },
    {
      accessorKey: "endingStock",
      header: () => <div className="text-right">Qty</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("endingStock")}</div>;
      },
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("unit")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{formatDate(row.getValue("lastUpdated"))}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onView(item)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="mt-4">
      <DataTable 
        columns={columns} 
        data={items} 
        searchKey="name"
        searchPlaceholder="Search inventory by name..."
      />
    </div>
  );
}
