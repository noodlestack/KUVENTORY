import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { BlankLayout } from "@/layouts/BlankLayout";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { RoleProtectedRoute } from "@/routes/RoleProtectedRoute";

import { EmptyState } from "@/components/common/EmptyState";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { Products } from "@/pages/products/Products";
import { Categories } from "@/pages/categories/Categories";
import { InventoryLayout } from "@/pages/inventory/InventoryLayout";
import { Suppliers } from "@/pages/suppliers/Suppliers";
import { PurchasesLayout } from "@/pages/purchases/PurchasesLayout";
import { SalesLayout } from "@/pages/sales/SalesLayout";
import { ExpensesLayout } from "@/pages/expenses/ExpensesLayout";
import { ReportsLayout } from "@/pages/reports/ReportsLayout";
import { ProfileLayout } from "@/pages/profile/ProfileLayout";
import { SettingsLayout } from "@/pages/settings/SettingsLayout";

import { Login } from "@/pages/auth/Login";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import { SessionExpired } from "@/pages/auth/SessionExpired";
import { Unauthorized } from "@/pages/error/Unauthorized";
import { NotFound } from "@/pages/error/NotFound";

// Placeholder for future pages
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-4">
      <EmptyState 
        title={`${title} Page`} 
        description={`This is the placeholder for the ${title} module. Components will be built in future phases.`}
        actionLabel="Go Back"
        onAction={() => window.history.back()}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <AuthProvider>
        <BrowserRouter>
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
                <Route path="/settings" element={<SettingsLayout />} />

                {/* Role Protected Routes */}
                <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                  <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                </Route>
              </Route>
            </Route>

            {/* Blank Routes (404, Unauthorized) */}
            <Route element={<BlankLayout />}>
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}

export default App;
