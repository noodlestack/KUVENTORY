import { Menu, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import LogoIcon from "@/assets/branding/logo-icon.png";
import { cn } from "@/utils/utils";
import { navigationConfig } from "./config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function MobileDrawer() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out.");
    navigate("/login");
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-background text-foreground border-r">
        <SheetHeader className="h-16 border-b flex items-center justify-center px-4 shrink-0">
          <SheetTitle className="flex items-center gap-2 m-0 mt-4 overflow-hidden">
            <img src={LogoIcon} alt="Logo" className="h-8 w-8 shrink-0" />
            <span className="text-xl font-bold whitespace-nowrap">Kuventory</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {navigationConfig.map((section, index) => (
            <div key={index} className="mb-6">
              <h4 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                {section.title}
              </h4>
              <nav className="space-y-2 px-4">
                {section.items.map((item) => (
                  <SheetTrigger asChild key={item.title}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-gray-900 dark:text-gray-100 hover:bg-accent hover:text-gray-900 dark:hover:text-white"
                        )
                      }
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      <span className="whitespace-nowrap">{item.title}</span>
                    </NavLink>
                  </SheetTrigger>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t p-4 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0 ring-1 ring-primary/30">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.username || "User"}</span>
              <span className="truncate text-xs text-gray-600 dark:text-gray-300">{user?.role || "Role"}</span>
            </div>
          </div>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="mt-4 w-full justify-start gap-3 rounded-lg px-4 py-3 text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10 overflow-hidden"
            >
              <LogOut className="h-6 w-6 shrink-0" />
              <span className="whitespace-nowrap">Logout</span>
            </Button>
          </SheetTrigger>
        </div>
      </SheetContent>
    </Sheet>
  );
}
