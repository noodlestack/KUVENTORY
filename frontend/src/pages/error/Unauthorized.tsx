import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <ShieldAlert className="h-16 w-16 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">403 Forbidden</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        You do not have permission to access this page. If you believe this is an error, please contact your administrator.
      </p>
      <Button onClick={() => navigate(-1)} variant="outline" size="lg">
        Go Back
      </Button>
    </div>
  );
}
