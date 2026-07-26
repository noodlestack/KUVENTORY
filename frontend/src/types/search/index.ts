

export type SearchCategory = "Dashboard" | "Inventory" | "Supply Chain" | "Finance" | "System";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  module: string;
  category: SearchCategory;
  href: string;
  shortcut?: string;
  icon?: string; // We'll map string names to Lucide icons in the component
}
