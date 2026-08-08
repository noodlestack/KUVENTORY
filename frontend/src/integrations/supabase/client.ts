import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}

// Custom storage adapter to handle 'Remember Me' persistence
const customStorage = {
  getItem: (key: string): string | null => {
    if (window.localStorage.getItem("kuventory-remember-me") === "true") {
      return window.localStorage.getItem(key);
    }
    return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (window.localStorage.getItem("kuventory-remember-me") === "true") {
      window.localStorage.setItem(key, value);
      window.sessionStorage.removeItem(key); // Cleanup session storage if exists
    } else {
      window.sessionStorage.setItem(key, value);
      window.localStorage.removeItem(key); // Cleanup local storage if exists
    }
  },
  removeItem: (key: string): void => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "kuventory-auth",
    storage: customStorage,
  },
  global: {
    headers: {
      "x-application-name": "kuventory",
    },
  },
});
