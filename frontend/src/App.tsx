import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { BlankLayout } from "@/layouts/BlankLayout";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { RoleProtectedRoute } from "@/routes/RoleProtectedRoute";

import React, { Suspense } from "react";
import { PageLoader } from "@/components/common/LoadingStates";
import { Dashboard } from "@/pages/dashboard/Dashboard";

const Products = React.lazy(() => import("@/pages/products/Products").then(m => ({ default: m.Products })));
const Categories = React.lazy(() => import("@/pages/categories/Categories").then(m => ({ default: m.Categories })));
const InventoryLayout = React.lazy(() => import("@/pages/inventory/InventoryLayout").then(m => ({ default: m.InventoryLayout })));
const Suppliers = React.lazy(() => import("@/pages/suppliers/Suppliers").then(m => ({ default: m.Suppliers })));
const PurchasesLayout = React.lazy(() => import("@/pages/purchases/PurchasesLayout").then(m => ({ default: m.PurchasesLayout })));
const SalesLayout = React.lazy(() => import("@/pages/sales/SalesLayout").then(m => ({ default: m.SalesLayout })));
const ExpensesLayout = React.lazy(() => import("@/pages/expenses/ExpensesLayout").then(m => ({ default: m.ExpensesLayout })));
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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryLayout />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/purchases" element={<PurchasesLayout />} />
                  <Route path="/sales" element={<SalesLayout />} />
                  <Route path="/expenses" element={<ExpensesLayout />} />
                  <Route path="/reports" element={<ReportsLayout />} />
                  <Route path="/profile" element={<ProfileLayout />} />

                  {/* Role Protected Routes */}
                  <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                    <Route path="/settings" element={<SettingsLayout />} />
                  </Route>
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
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}

export default App;
