
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | TaskSync Pilot";
    
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // This provides an immediate redirect if auth state is already available
  if (isAuthenticated) {
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
