import * as React from "react";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "./MobileDrawer";
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import LogoIcon from "@/assets/branding/logo-icon.png";

interface NavbarProps {
  toggleSidebar: () => void;
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile Drawer (visible on small screens) */}
      <MobileDrawer />

      {/* Desktop Sidebar Toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* Branding */}
      <div className="flex items-center gap-2">
        <img src={LogoIcon} alt="Kuventory Logo" className="h-8 w-8 shrink-0" />
        <span className="hidden sm:block text-xl font-bold text-foreground tracking-tight whitespace-nowrap">Kuventory</span>
      </div>

      {/* Separator for desktop */}
      <div className="hidden md:block h-6 w-px bg-border" aria-hidden="true" />

      {/* Breadcrumbs */}
      <div className="flex flex-1">
        <DynamicBreadcrumb />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        
        {/* Search */}
        <Button 
          variant="outline" 
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex h-9 w-full max-w-sm justify-start text-muted-foreground rounded-full border-border bg-background px-4 hover:bg-secondary transition-colors"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSearchOpen(true)}
          className="sm:hidden h-9 w-9 rounded-full hover:bg-secondary transition-colors"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Notifications */}
        <NotificationCenter />

        {/* Theme Toggle */}
        <ThemeToggle />

      </div>
    </header>
  );
}
