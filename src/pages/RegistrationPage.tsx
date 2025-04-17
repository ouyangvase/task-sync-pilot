
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import RegistrationForm from "@/components/auth/RegistrationForm";

const RegistrationPage = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "Register | TaskSync Pilot";
  }, []);

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
        <RegistrationForm />
      </div>
    </div>
  );
};

export default RegistrationPage;
