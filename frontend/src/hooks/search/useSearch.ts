import { useState, useEffect } from "react";
import { SearchResult } from "@/types/search";
import { mockSearchService } from "@/services/search/mockSearchService";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    const loadRecent = async () => {
      const recent = await mockSearchService.getRecentSearches();
      setRecentSearches(recent);
    };
    loadRecent();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query) {
      queueMicrotask(() => {
        setResults([]);
        setIsSearching(false);
      });
      return;
    }

    queueMicrotask(() => setIsSearching(true));
    const handler = setTimeout(async () => {
      try {
        const data = await mockSearchService.search(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    recentSearches,
    isSearching,
  };
}
