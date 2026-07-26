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


export function MobileDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="h-16 border-b flex items-center justify-center px-4">
          <SheetTitle className="flex items-center gap-2 m-0 mt-4 overflow-hidden">
            <img src={LogoIcon} alt="Logo" className="h-8 w-8 shrink-0" />
            <span className="text-xl font-bold whitespace-nowrap">Kuventory</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {navigationConfig.map((section, index) => (
            <div key={index} className="mb-6">
              <h4 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <nav className="space-y-1 px-3">
                {section.items.map((item) => (
                  <SheetTrigger asChild key={item.title}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="whitespace-nowrap">{item.title}</span>
                    </NavLink>
                  </SheetTrigger>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0 ring-1 ring-primary/30">
              A
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-foreground">Admin User</span>
              <span className="truncate text-xs text-muted-foreground">Administrator</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="mt-4 w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 overflow-hidden"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap">Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
