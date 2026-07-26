import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCog } from "lucide-react";
import { UserTable } from "@/components/settings/UserTable";
import { UserFormDialog } from "@/components/settings/UserFormDialog";
import { useUsers } from "@/hooks/settings/useSettings";
import { UserAccount } from "@/types/settings";

export function UserManagement() {
  const { users, isLoading, createUser, updateUser } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (userId: string, newStatus: "Active" | "Inactive") => {
    const confirmation = window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`);
    if (confirmation) {
      await updateUser(userId, { status: newStatus });
    }
  };

  const handleSubmit = async (data: Partial<UserAccount>) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data as any);
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground">Loading users...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-6">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription className="mt-1">
            Manage system access, roles, and status for all staff members.
          </CardDescription>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </CardHeader>
      <CardContent>
        <UserTable 
          users={users} 
          onEdit={handleOpenEdit} 
          onToggleStatus={handleToggleStatus} 
        />
      </CardContent>
      
      <UserFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        user={selectedUser} 
        onSubmit={handleSubmit} 
      />
    </Card>
  );
}
