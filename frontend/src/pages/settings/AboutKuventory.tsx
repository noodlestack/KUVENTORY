import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AboutKuventory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Kuventory</CardTitle>
        <CardDescription>System version and licensing information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Application</h4>
            <p className="font-semibold text-lg">Kuventory</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
            <Badge variant="outline" className="mt-1 border-success text-success">Frontend Stable</Badge>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Version</h4>
            <p className="font-mono text-sm">v1.3.0</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Backend & Database</h4>
            <p className="text-sm">Django REST Framework / PostgreSQL<br/><span className="text-xs text-muted-foreground">(Integration Pending)</span></p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Core Technologies</h4>
            <p className="text-sm mt-1">React 19, TypeScript, Vite, Tailwind CSS</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Target Platform</h4>
            <p className="text-sm mt-1">Desktop, Tablet, Mobile</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">License</h4>
          <p className="text-sm">
            This software is proprietary to Kape Uno Bistro. All rights reserved. 
            Unauthorized copying, modification, or distribution is strictly prohibited.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
