import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useProfile } from "@/hooks/settings/useSettings";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { profile, updatePreferences } = useProfile();

  if (!profile) return <div className="p-4 text-muted-foreground">Loading preferences...</div>;

  const handleThemeChange = (val: string) => {
    setTheme(val);
    updatePreferences({ theme: val as "light" | "dark" | "system" });
  };

  const handleDensityChange = (val: string) => {
    updatePreferences({ tableDensity: val as "comfortable" | "compact" });
  };

  const handleAnimationsToggle = (val: boolean) => {
    updatePreferences({ animations: val });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>Customize how Kuventory looks and feels on your device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        <div className="space-y-4">
          <Label className="text-base font-semibold">Theme</Label>
          <p className="text-sm text-muted-foreground mb-4">Select your preferred color theme.</p>
          <RadioGroup value={theme} onValueChange={handleThemeChange} className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="font-normal">Light Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="font-normal">Dark Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="font-normal">System Default</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Table Density</Label>
          <p className="text-sm text-muted-foreground mb-4">Choose how tightly data should be packed into tables.</p>
          <RadioGroup value={profile.preferences.tableDensity} onValueChange={handleDensityChange} className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="density-comf" />
              <Label htmlFor="density-comf" className="font-normal">Comfortable (More padding)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="density-comp" />
              <Label htmlFor="density-comp" className="font-normal">Compact (Fit more data)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          <div className="space-y-0.5">
            <Label className="text-base font-semibold">Enable Animations</Label>
            <p className="text-sm text-muted-foreground">Show micro-animations and transitions.</p>
          </div>
          <Switch 
            checked={profile.preferences.animations} 
            onCheckedChange={handleAnimationsToggle} 
          />
        </div>

      </CardContent>
    </Card>
  );
}
