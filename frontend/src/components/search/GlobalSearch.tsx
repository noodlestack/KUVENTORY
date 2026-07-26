import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/search/useSearch";
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Truck, 
  ShoppingCart, 
  CreditCard, 
  PieChart, 
  Settings, 
  UserCircle,
  FileText,
  Search as SearchIcon,
  Loader2
} from "lucide-react";
import { SearchResult } from "@/types/search";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to map categories/modules to icons
const getIconForCategory = (moduleName: string) => {
  switch (moduleName) {
    case "Dashboard": return <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Products": return <Package className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Inventory": return <Boxes className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Suppliers": return <Truck className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Purchases": return <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Sales": return <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Expenses": return <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Reports": return <PieChart className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Settings": return <Settings className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Users": return <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Profile": return <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "Activity Logs": return <FileText className="mr-2 h-4 w-4 text-muted-foreground" />;
    default: return <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />;
  }
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { query, setQuery, results, recentSearches, isSearching } = useSearch();

  // Group results by category
  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }, [results]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={query} 
        onValueChange={setQuery} 
      />
      <CommandList className="scrollbar-thin">
        {isSearching && (
          <div className="py-6 text-center text-sm flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mb-2" />
            Searching...
          </div>
        )}
        
        {!isSearching && results.length === 0 && query && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {!query && recentSearches.length > 0 && (
          <CommandGroup heading="Recent Searches">
            {recentSearches.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title}
                onSelect={() => handleSelect(item.href)}
              >
                {getIconForCategory(item.module)}
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
                {item.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>{item.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query && Object.entries(groupedResults).map(([category, items]) => (
          <React.Fragment key={category}>
            <CommandGroup heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title + " " + item.module}
                  onSelect={() => handleSelect(item.href)}
                >
                  {getIconForCategory(item.module)}
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                      {item.module}
                    </span>
                    {item.shortcut && (
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>{item.shortcut}
                      </kbd>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
