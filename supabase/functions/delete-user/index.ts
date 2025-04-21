
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdminClient = createClient(
      // Supabase API URL - env var exported by default when deployed
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase service role key - env var exported by default when deployed
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the userId from the request
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log(`Attempting to delete user with ID: ${userId}`);
    
    // Since we're using the service role key, let's be extra cautious
    // Check if the user exists in profiles table before deletion
    const { data: profileData, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error checking if user exists:", profileError);
      throw new Error("Error checking if user exists");
    }

    if (!profileData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Delete the user from auth.users
    const { error: deleteError } = await supabaseAdminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error("Error in delete-user function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred while deleting the user" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
