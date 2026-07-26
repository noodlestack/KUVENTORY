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
            <h4 className="text-sm font-medium text-muted-foreground">Application Name</h4>
            <p className="font-semibold text-lg">Kuventory IMS</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Environment</h4>
            <Badge variant="outline" className="mt-1">Production (Mock)</Badge>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Frontend Version</h4>
            <p className="font-mono text-sm">v0.1.0-alpha</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Backend Version</h4>
            <p className="font-mono text-sm">Waiting for Backend Dev 1 & 2 integration</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Core Technologies</h4>
            <p className="text-sm mt-1">React 18, Vite, TailwindCSS, Shadcn/UI, Zod</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Build Date</h4>
            <p className="text-sm mt-1">{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
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
