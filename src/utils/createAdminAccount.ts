
import { supabase } from "@/integrations/supabase/client";

export const createAdminAccount = async () => {
  try {
    console.log("Creating admin account with email: admin@tasksync.com");
    
    // First, try to sign up the admin user
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
      console.error("Error during signup:", error);
      throw error;
    }
    
    if (data?.user) {
      console.log("User created successfully:", data.user.id);
      
      // Wait for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if profile exists and update role to admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error checking profile:", profileError);
        throw profileError;
      }
      
      if (profile) {
        console.log("Profile found, updating role to admin");
        
        // Update the user role to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            full_name: 'System Administrator',
            email: 'admin@tasksync.com'
          })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.error("Error updating user role:", updateError);
          throw updateError;
        }
        
        console.log("Admin role assigned successfully");
      } else {
        console.log("Profile not found, creating manually");
        
        // Create profile manually if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: 'System Administrator',
            email: 'admin@tasksync.com',
            role: 'admin',
            is_approved: true
          });
          
        if (insertError) {
          console.error("Error creating profile manually:", insertError);
          throw insertError;
        }
        
        console.log("Admin profile created successfully");
      }
      
      return data.user;
    } else {
      throw new Error("User creation failed - no user data returned");
    }
  } catch (error) {
    console.error("Failed to create admin account:", error);
    throw error;
  }
};
