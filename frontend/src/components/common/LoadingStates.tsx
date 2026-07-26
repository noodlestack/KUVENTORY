import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import LogoIcon from "@/assets/branding/logo-icon.png";

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };
  return <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />;
}

export function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src={LogoIcon} alt="Loading..." className="h-16 w-16 animate-pulse" />
        <Spinner size="md" />
      </div>
    </div>
  );
}

export function ContentLoader() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <Spinner />
    </div>
  );
}

export function SkeletonPlaceholder({ className }: { className?: string }) {
  return <Skeleton className={className || "h-full w-full rounded-md"} />;
}
