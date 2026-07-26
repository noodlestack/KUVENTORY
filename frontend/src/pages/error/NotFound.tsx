import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">404 Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate("/")} size="lg">
        Return to Dashboard
      </Button>
    </div>
  );
}
