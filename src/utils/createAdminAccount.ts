
import { supabase } from "@/integrations/supabase/client";

export const createAdminAccount = async () => {
  try {
    console.log("Creating admin account...");
    
    // Create the admin user account
    const { data, error } = await supabase.auth.signUp({
      email: "admin@tasksync.com",
      password: "admin123456",
      options: {
        data: {
          full_name: "System Administrator",
        },
      }
    });
    
    if (error) {
      console.error("Error creating admin account:", error);
      throw error;
    }
    
    if (data?.user) {
      console.log("Admin account created successfully:", data.user.id);
      
      // Wait a moment for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the user role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          full_name: 'System Administrator'
        })
        .eq('id', data.user.id);
        
      if (updateError) {
        console.error("Error updating user role:", updateError);
        throw updateError;
      }
      
      console.log("Admin role assigned successfully");
      return data.user;
    }
  } catch (error) {
    console.error("Failed to create admin account:", error);
    throw error;
  }
};
