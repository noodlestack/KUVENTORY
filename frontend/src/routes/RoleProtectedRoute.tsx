import { Navigate, Outlet } from "react-router-dom";
import { useAuth, Role } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/common/LoadingStates";

interface RoleProtectedRouteProps {
  allowedRoles: Role[];
}

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
