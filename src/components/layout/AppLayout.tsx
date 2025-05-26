
import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import { useScreenSize } from "@/hooks/use-mobile";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { cn } from "@/lib/utils";

const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isMobile, isTablet, isDesktop } = useScreenSize();
  
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, isTablet]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile/tablet
  const handleContentClick = () => {
    if ((isMobile || isTablet) && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <AppHeader toggleSidebar={toggleSidebar} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Overlay for mobile and tablet */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm"
          onClick={handleContentClick}
          aria-hidden="true"
        />
      )}
      
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarOpen && isDesktop ? "md:pl-64" : "",
          "w-full"
        )}
        onClick={handleContentClick}
      >
        <ResponsiveContainer variant="page">
          <Outlet />
        </ResponsiveContainer>
      </main>
    </div>
  );
};

export default AppLayout;
