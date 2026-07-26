import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Truck, 
  ShoppingCart, 
  CreditCard, 
  PieChart, 
  Settings, 
  UserCircle 
} from "lucide-react";

export const navigationConfig = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "Inventory Management",
    items: [
      { title: "Inventory", href: "/inventory", icon: Boxes },
      { title: "Products", href: "/products", icon: Package },
    ]
  },
  {
    title: "Supply Chain",
    items: [
      { title: "Suppliers", href: "/suppliers", icon: Truck },
      { title: "Purchases", href: "/purchases", icon: ShoppingCart },
    ]
  },
  {
    title: "Finance & Reports",
    items: [
      { title: "Sales", href: "/sales", icon: CreditCard },
      { title: "Expenses", href: "/expenses", icon: CreditCard },
      { title: "Reports", href: "/reports", icon: PieChart },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Profile", href: "/profile", icon: UserCircle },
    ]
  }
];
