
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmployeeRegistrationForm from "@/components/auth/EmployeeRegistrationForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EmployeeRegistrationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidInvite, setIsValidInvite] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const token = searchParams.get("token");

  useEffect(() => {
    document.title = "Complete Registration | TaskSync Pilot";

    if (!token) {
      toast.error("Invalid invitation link");
      setIsValidInvite(false);
      setLoading(false);
      return;
    }

    // In a real app, this would be an API call to validate the invite token
    const validateInvite = async () => {
      try {
        // Simulating API call to validate token
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // For the sake of this demo, assume all tokens starting with "valid" are valid
        if (token.startsWith("valid")) {
          setIsValidInvite(true);
          setEmail("invited.employee@example.com"); // In real app, this would be fetched from the API
        } else {
          setIsValidInvite(false);
          toast.error("This invitation link is invalid or has expired");
        }
      } catch (error) {
        console.error("Error validating invitation:", error);
        toast.error("Failed to validate invitation");
        setIsValidInvite(false);
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!isValidInvite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 rounded-full p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-destructive h-6 w-6"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
        <p className="text-muted-foreground text-center mb-6">
          The invitation link you followed is invalid or has expired.
          Please contact your administrator for a new invitation.
        </p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl">
      <EmployeeRegistrationForm email={email} inviteToken={token} />
    </div>
  );
};

export default EmployeeRegistrationPage;
