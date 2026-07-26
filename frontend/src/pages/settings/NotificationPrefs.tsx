import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNotificationSettings } from "@/hooks/settings/useSettings";

export function NotificationPrefs() {
  const { settings, isLoading, updateSettings } = useNotificationSettings();

  if (isLoading || !settings) return <div className="p-4 text-muted-foreground">Loading notifications...</div>;

  const handleToggle = (key: keyof typeof settings, checked: boolean) => {
    updateSettings({ [key]: checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how the system alerts you about important events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[300px] md:max-w-md">
            <Label className="text-base">System Announcements</Label>
            <p className="text-sm text-muted-foreground">Receive updates about system maintenance and new features.</p>
          </div>
          <Switch checked={settings.systemAnnouncements} onCheckedChange={(val: boolean) => handleToggle('systemAnnouncements', val)} />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 max-w-[300px] md:max-w-md">
            <Label className="text-base">Low Stock Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified immediately when an item hits its minimum threshold.</p>
          </div>
          <Switch checked={settings.lowStockAlerts} onCheckedChange={(val: boolean) => handleToggle('lowStockAlerts', val)} />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 max-w-[300px] md:max-w-md">
            <Label className="text-base">Inventory Adjustments</Label>
            <p className="text-sm text-muted-foreground">Receive a summary of manual inventory adjustments by staff.</p>
          </div>
          <Switch checked={settings.inventoryNotifications} onCheckedChange={(val: boolean) => handleToggle('inventoryNotifications', val)} />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 max-w-[300px] md:max-w-md">
            <Label className="text-base">Purchasing Notifications</Label>
            <p className="text-sm text-muted-foreground">Alerts for new purchase orders and supplier deliveries.</p>
          </div>
          <Switch checked={settings.purchaseNotifications} onCheckedChange={(val: boolean) => handleToggle('purchaseNotifications', val)} />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 max-w-[300px] md:max-w-md">
            <Label className="text-base">Sales Summary</Label>
            <p className="text-sm text-muted-foreground">Receive an end-of-day sales summary report.</p>
          </div>
          <Switch checked={settings.salesNotifications} onCheckedChange={(val: boolean) => handleToggle('salesNotifications', val)} />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 max-w-[300px] md:max-w-md">
            <Label className="text-base">Expense Thresholds</Label>
            <p className="text-sm text-muted-foreground">Alerts when large operational expenses are recorded.</p>
          </div>
          <Switch checked={settings.expenseNotifications} onCheckedChange={(val: boolean) => handleToggle('expenseNotifications', val)} />
        </div>

      </CardContent>
    </Card>
  );
}
