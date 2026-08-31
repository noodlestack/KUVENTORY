import { 
  Boxes, 
  PieChart, 
  Settings, 
  UserCircle,
  Tags
} from "lucide-react";
import React from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: "Inventory Management",
    items: [
      { title: "Inventory", href: "/inventory", icon: Boxes },
      { title: "Categories", href: "/categories", icon: Tags },
    ],
  },
  {
    title: "Analytics",
    items: [
      { title: "Reports", href: "/reports", icon: PieChart },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Profile", href: "/profile", icon: UserCircle },
    ]
  }
];
