import { Outlet } from "react-router-dom";
import LogoTransparent from "@/assets/branding/logo-transparent.png";

export function AuthLayout() {
  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-background p-4 sm:p-8 overflow-y-auto">
      <div className="m-auto w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <img 
            src={LogoTransparent}
            alt="Kape Uno Bistro" 
            className="h-24 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kuventory</h1>
          <p className="text-sm text-muted-foreground">Inventory Management System</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-DEFAULT sm:p-8">
          <Outlet />
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Kape Uno Bistro. All rights reserved.
        </div>
      </div>
    </div>
  );
}
