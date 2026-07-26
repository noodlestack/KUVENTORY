import { NavLink, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import LogoIcon from "@/assets/branding/logo-icon.png";
import { cn } from "@/utils/utils";
import { navigationConfig } from "./config";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, HelpCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-card border-r transition-all duration-300 z-20 h-screen sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-4">
        {isCollapsed ? (
          <img src={LogoIcon} alt="Logo" className="h-8 w-8" />
        ) : (
          <div className="flex items-center gap-2">
            <img src={LogoIcon} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground tracking-tight">Kuventory</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <TooltipProvider delayDuration={0}>
          {navigationConfig.map((section, index) => (
            <div key={index} className="mb-6">
              {!isCollapsed && (
                <h4 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h4>
              )}
              <nav className="space-y-1 px-3">
                {section.items.map((item) => (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          (location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href)))
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                          isCollapsed && "justify-center px-0 py-3"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", isCollapsed ? "h-6 w-6" : "")} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </nav>
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Footer / User Area */}
      <div className="border-t p-4 bg-muted/20 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn("flex items-center cursor-pointer hover:bg-muted p-2 rounded-md transition-colors", isCollapsed ? "justify-center" : "gap-3")}>
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0 ring-1 ring-primary/30">
                {user?.username ? user.username.charAt(0) : "U"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-semibold text-foreground">{user?.username || "User"}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.role || "Staff"}</span>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isCollapsed ? "start" : "end"} side="right" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Help & Support coming soon")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Kuventory v1.3.0")}>
              <Info className="mr-2 h-4 w-4" />
              <span>About Kuventory</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn("mt-4 w-full text-destructive hover:text-destructive hover:bg-destructive/10", isCollapsed ? "px-0" : "justify-start gap-2")}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out? You will need to sign in again to access the dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
