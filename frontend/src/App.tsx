import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { BlankLayout } from "@/layouts/BlankLayout";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";

import React, { Suspense } from "react";
import { PageLoader } from "@/components/common/LoadingStates";

const InventoryLayout = React.lazy(() => import("@/pages/inventory/InventoryLayout").then(m => ({ default: m.InventoryLayout })));
import { CategoryManagement } from "@/pages/categories/CategoryManagement";
const ReportsLayout = React.lazy(() => import("@/pages/reports/ReportsLayout").then(m => ({ default: m.ReportsLayout })));
const ProfileLayout = React.lazy(() => import("@/pages/profile/ProfileLayout").then(m => ({ default: m.ProfileLayout })));
const SettingsLayout = React.lazy(() => import("@/pages/settings/SettingsLayout").then(m => ({ default: m.SettingsLayout })));

import { Login } from "@/pages/auth/Login";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import { SessionExpired } from "@/pages/auth/SessionExpired";
import { Unauthorized } from "@/pages/error/Unauthorized";
import { NotFound } from "@/pages/error/NotFound";

function App() {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <HashRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  
                  {/* Public Routes (Login, Reset Password) */}
                  <Route element={<PublicRoute />}>
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>
                  </Route>

                  {/* Session Expired can be accessed without auth but clears token */}
                  <Route element={<AuthLayout />}>
                    <Route path="/session-expired" element={<SessionExpired />} />
                  </Route>

                  {/* Protected Routes (Main Application) */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      {/* Redirect root to inventory */}
                      <Route path="/" element={<Navigate to="/inventory" replace />} />
                      <Route path="/profile" element={<ProfileLayout />} />

                      {/* Inventory Core */}
                      <Route path="/inventory" element={<InventoryLayout />} />
                      <Route path="/categories" element={<CategoryManagement />} />
                      
                      {/* Reports */}
                      <Route path="/reports" element={<ReportsLayout />} />

                      {/* Settings / System */}
                      <Route path="/settings" element={<SettingsLayout />} />
                    </Route>
                  </Route>

                  {/* Blank Routes (404, Unauthorized) */}
                  <Route element={<BlankLayout />}>
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                </Routes>
              </Suspense>
            </HashRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}

export default App;
