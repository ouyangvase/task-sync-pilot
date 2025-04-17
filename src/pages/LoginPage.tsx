
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    document.title = "Login | TaskSync Pilot";
  }, []);

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    console.log("Already authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">TaskSync Pilot</h1>
          <p className="text-muted-foreground mt-2">
            Employee task management system
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
