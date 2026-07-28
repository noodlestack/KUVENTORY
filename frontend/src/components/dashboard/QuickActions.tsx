import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, Truck, PhilippinePeso, BarChart3, Settings } from "lucide-react";

const actions = [
  { label: "Inventory", icon: Package, href: "/inventory" },
  { label: "Products", icon: ShoppingCart, href: "/products" },
  { label: "Sales", icon: PhilippinePeso, href: "/sales" },
  { label: "Purchases", icon: Truck, href: "/purchases" },
  { label: "Suppliers", icon: Users, href: "/suppliers" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-primary/5 hover:text-primary transition-colors border-border/50"
              asChild
            >
              <Link to={action.href}>
                <Icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
