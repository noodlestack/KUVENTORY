import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { ActivityTimeline } from "@/components/settings/ActivityTimeline";
import { useActivityLogs } from "@/hooks/settings/useSettings";

export function ActivityLogsPage() {
  const { logs, isLoading } = useActivityLogs();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");

  if (isLoading) return <div className="p-4 text-muted-foreground">Loading activity logs...</div>;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                          log.description.toLowerCase().includes(search.toLowerCase()) || 
                          log.user.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>Comprehensive audit trail of all system actions.</CardDescription>
      </CardHeader>
      <CardContent>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by action, user, or description..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter Module" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Modules</SelectItem>
                <SelectItem value="Settings">Settings</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Purchases">Purchases</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ActivityTimeline logs={filteredLogs} />

      </CardContent>
    </Card>
  );
}
