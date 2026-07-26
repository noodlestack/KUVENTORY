import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex min-h-screen w-full bg-secondary/30">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
