import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { inactivityTimeout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to session-expired page when inactivity timeout fires
  useEffect(() => {
    if (inactivityTimeout && !isAuthenticated) {
      navigate("/session-expired", { replace: true });
    }
  }, [inactivityTimeout, isAuthenticated, navigate]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex h-dvh flex-col w-full bg-secondary/30 overflow-hidden">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden min-h-0 transition-all duration-300">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        
        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          <main className="flex-1 overflow-y-auto min-h-0 flex flex-col">
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-7xl animate-fade-in">
                <Outlet />
              </div>
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
