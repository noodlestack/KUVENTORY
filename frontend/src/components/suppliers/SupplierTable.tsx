import { Supplier } from "@/types/suppliers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Eye, Trash2, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface SupplierTableProps {
  suppliers: Supplier[];
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({ suppliers, onView, onEdit, onDelete }: SupplierTableProps) {
  
  const formatDate = (dateStr?: string) => dateStr ? new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(new Date(dateStr)) : "Never";

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8 data-[state=open]:bg-accent"
          >
            Supplier Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
    },
    {
      id: "contactInfo",
      header: "Phone / Email",
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div>
            <div className="text-sm">{supplier.phoneNumber}</div>
            <div className="text-xs text-muted-foreground">{supplier.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "totalPurchases",
      header: () => <div className="text-right">Total Purchases</div>,
      cell: ({ row }) => <div className="text-right">{row.getValue("totalPurchases")}</div>,
    },
    {
      accessorKey: "lastPurchaseDate",
      header: "Last Purchase",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{formatDate(row.getValue("lastPurchaseDate"))}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const supplier = row.original;
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
                <DropdownMenuItem onClick={() => onView(supplier)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(supplier)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(supplier)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
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
        data={suppliers} 
        searchKey="name"
        searchPlaceholder="Search suppliers..."
      />
    </div>
  );
}
