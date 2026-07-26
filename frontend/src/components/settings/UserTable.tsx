import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserAccount } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Edit, Ban, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: UserAccount[];
  onEdit: (user: UserAccount) => void;
  onToggleStatus: (userId: string, newStatus: "Active" | "Inactive") => void;
}

export function UserTable({ users, onEdit, onToggleStatus }: UserTableProps) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrator": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "Cashier": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Inventory Stocker": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium leading-none mb-1">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {user.lastLogin === "Never" ? "Never" : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(user.lastLogin))}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} title="Edit User">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.status === "Active" ? (
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onToggleStatus(user.id, "Inactive")} title="Deactivate User">
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-emerald-600 hover:text-emerald-600 hover:bg-emerald-600/10" onClick={() => onToggleStatus(user.id, "Active")} title="Activate User">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
