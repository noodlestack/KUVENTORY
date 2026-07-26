import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantInfo } from "./RestaurantInfo";
import { AppearanceSettings } from "./AppearanceSettings";
import { NotificationPrefs } from "./NotificationPrefs";
import { UserManagement } from "./UserManagement";
import { ActivityLogsPage } from "./ActivityLogsPage";
import { AboutKuventory } from "./AboutKuventory";

export function SettingsLayout() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage your restaurant, users, and application configurations.</p>
      </div>
      
      <Tabs defaultValue="restaurant" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex flex-row md:flex-col justify-start md:justify-start h-auto w-full md:w-64 bg-transparent p-0 gap-2 overflow-x-auto">
          <TabsTrigger value="restaurant" className="md:justify-start px-4 py-2 w-full data-[state=active]:bg-muted">Restaurant Info</TabsTrigger>
          <TabsTrigger value="appearance" className="md:justify-start px-4 py-2 w-full data-[state=active]:bg-muted">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="md:justify-start px-4 py-2 w-full data-[state=active]:bg-muted">Notifications</TabsTrigger>
          <TabsTrigger value="users" className="md:justify-start px-4 py-2 w-full data-[state=active]:bg-muted">User Management</TabsTrigger>
          <TabsTrigger value="logs" className="md:justify-start px-4 py-2 w-full data-[state=active]:bg-muted">Activity Logs</TabsTrigger>
          <TabsTrigger value="about" className="md:justify-start px-4 py-2 w-full data-[state=active]:bg-muted">About</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 w-full mt-0">
          <TabsContent value="restaurant" className="m-0"><RestaurantInfo /></TabsContent>
          <TabsContent value="appearance" className="m-0"><AppearanceSettings /></TabsContent>
          <TabsContent value="notifications" className="m-0"><NotificationPrefs /></TabsContent>
          <TabsContent value="users" className="m-0"><UserManagement /></TabsContent>
          <TabsContent value="logs" className="m-0"><ActivityLogsPage /></TabsContent>
          <TabsContent value="about" className="m-0"><AboutKuventory /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
