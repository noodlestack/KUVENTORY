import React from "react";
import { Menu, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/utils";
import { navigationConfig } from "./config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { hasAnyRole } from "@/utils/rbac";

export function MobileDrawer() {
  const { user, profile, roles, primaryRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    toast.success("Successfully logged out.");
    navigate("/login");
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User";
  const displayRole = primaryRole || "Staff";
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card text-card-foreground border-r h-[100dvh]">
        
        {/* Logo / Header */}
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
          <span className="text-lg font-bold tracking-tight">Kuventory</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {navigationConfig
            .map(section => ({
              ...section,
              items: section.items.filter(item => !item.allowedRoles || hasAnyRole(roles, item.allowedRoles))
            }))
            .filter(section => section.items.length > 0)
            .map((section, index) => (
            <div key={index} className="mb-6">
              <h4 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <nav className="space-y-2 px-4">
                {section.items.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.href}
                    end={item.href === "/"}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      )
                    }
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    <span className="whitespace-nowrap">{item.title}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t p-4 bg-muted/20 shrink-0 pb-6 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0 ring-1 ring-primary/30">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{displayRole}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="mt-4 w-full justify-start gap-3 rounded-lg px-4 py-3 text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10 overflow-hidden"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span className="whitespace-nowrap">Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
