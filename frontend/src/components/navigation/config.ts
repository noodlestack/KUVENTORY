import { 
  LayoutDashboard, 
  Boxes, 
  Truck, 
  ShoppingCart, 
  CreditCard, 
  PieChart, 
  Settings, 
  UserCircle,
  Tag,
  Tags
} from "lucide-react";
import { RoleName } from "@/utils/rbac";
import React from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  allowedRoles?: RoleName[];
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
      { title: "Inventory", href: "/inventory", icon: Boxes, allowedRoles: ["Administrator", "Manager", "Inventory Staff", "Kitchen Staff"] },
      { title: "Categories", href: "/categories", icon: Tags, allowedRoles: ["Administrator", "Manager", "Inventory Staff", "Kitchen Staff"] },
    ]
  },
  {
    title: "Supply Chain",
    items: [
      { title: "Suppliers", href: "/suppliers", icon: Truck, allowedRoles: ["Administrator", "Manager", "Inventory Staff"] },
      { title: "Purchases", href: "/purchases", icon: ShoppingCart, allowedRoles: ["Administrator", "Manager", "Inventory Staff"] },
    ]
  },
  {
    title: "Finance & Reports",
    items: [
      { title: "Sales", href: "/sales", icon: CreditCard, allowedRoles: ["Administrator", "Manager", "Cashier"] },
      { title: "Discounts", href: "/discounts", icon: Tag, allowedRoles: ["Administrator", "Manager", "Cashier"] },
      { title: "Expenses", href: "/expenses", icon: CreditCard, allowedRoles: ["Administrator", "Manager"] },
      { title: "Reports", href: "/reports", icon: PieChart, allowedRoles: ["Administrator", "Manager", "Viewer"] },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: Settings, allowedRoles: ["Administrator", "Manager"] },
      { title: "Profile", href: "/profile", icon: UserCircle },
    ]
  }
];
