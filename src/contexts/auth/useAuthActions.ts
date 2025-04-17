
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

interface AuthActionsProps {
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthActions = ({ setCurrentUser, setLoading }: AuthActionsProps) => {
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login successful");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, department?: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            department: department || ''
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Registration successful! You can now login.");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  // Reset app data - deleting all tasks for admin use only
  const resetAppData = async () => {
    try {
      setLoading(true);
      
      // Clear local storage data
      localStorage.removeItem("tasks");
      localStorage.removeItem("rewardTiers");
      localStorage.removeItem("monthlyTarget");
      localStorage.removeItem("userPoints");
      
      toast.success("App data has been reset successfully");
    } catch (error) {
      console.error("Error resetting app data:", error);
      toast.error("Failed to reset app data");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    resetAppData
  };
};
