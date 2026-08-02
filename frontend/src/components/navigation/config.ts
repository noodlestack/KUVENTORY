import { 
  LayoutDashboard, 
  Boxes, 
  Truck, 
  ShoppingCart, 
  CreditCard, 
  PieChart, 
  Settings, 
  UserCircle,
  Tag
} from "lucide-react";
import { Role } from "@/contexts/AuthContext";

import React from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  allowedRoles?: Role[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
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
      { title: "Discounts", href: "/discounts", icon: Tag },
      { title: "Expenses", href: "/expenses", icon: CreditCard },
      { title: "Reports", href: "/reports", icon: PieChart },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: Settings, allowedRoles: ["Admin", "Manager"] },
      { title: "Profile", href: "/profile", icon: UserCircle },
    ]
  }
];
