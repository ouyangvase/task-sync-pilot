import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const useAuthOperations = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const registerUser = async (email: string, password: string, fullName: string): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "employee",
            is_approved: false
          }
        }
      });

      if (error) throw new Error(error.message);

      const userId = data.user?.id;
      if (!userId) throw new Error("User ID not returned from Supabase");

      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email,
        full_name: fullName,
        role: "employee",
        is_approved: false
      });

      if (insertError) throw new Error("Database error saving new user: " + insertError.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error("Invalid email or password");

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("full_name, role, is_approved")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) throw new Error("User profile not found");
      if (!profile.is_approved) throw new Error("Your account is pending admin approval");

      const enhancedUser: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile.full_name,
        role: profile.role,
        isApproved: profile.is_approved,
        permissions: [] // Optional: Load from another source
      };

      setCurrentUser(enhancedUser);
      localStorage.setItem("currentUser", JSON.stringify(enhancedUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const approveUser = async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from("users")
      .update({ is_approved: true })
      .eq("id", userId);

    if (error) throw new Error("Failed to approve user: " + error.message);
  };

  const rejectUser = async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) throw new Error("Failed to reject user: " + error.message);
  };

  return {
    currentUser,
    setCurrentUser,
    loading,
    registerUser,
    login,
    logout,
    approveUser,
    rejectUser
  };
};
