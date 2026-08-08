/**
 * Utility for managing JWT tokens in Local Storage.
 * Prepares the frontend for Backend Developer 1's Django REST Framework (Previous backend architecture discarded. New backend architecture pending.) JWT APIs.
 */

const ACCESS_TOKEN_KEY = "kuventory_access_token";
const REFRESH_TOKEN_KEY = "kuventory_refresh_token";

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: () => {
    // Basic check. A full check would verify JWT expiration.
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }
};

