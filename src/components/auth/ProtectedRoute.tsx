
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  // Add a small delay to avoid quick flashes of loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state only when genuinely still loading
  if (loading || localLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and data is loaded
  return <Outlet />;
};

export default ProtectedRoute;
