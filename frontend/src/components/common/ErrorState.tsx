import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  statusCode?: number;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "An unexpected error occurred while loading this content.",
  statusCode,
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-2xl font-bold text-foreground">
        {statusCode ? `${statusCode} | ${title}` : title}
      </h3>
      <p className="mt-2 text-muted-foreground max-w-md">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6">
          Try Again
        </Button>
      )}
    </div>
  );
}
