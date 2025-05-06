
// Edge Function to check user roles
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Check user role in user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
      
    if (roleError) {
      // If no role found, check profile table as fallback
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
        
      if (profileError) {
        return new Response(
          JSON.stringify({ error: "User not found", details: profileError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
      
      // Create role mapping
      const roleMapping: Record<string, string> = {
        "admin": "admin",
        "manager": "landlord",
        "team_lead": "tenant",
        "employee": "merchant"
      };
      
      // Add user role if missing
      const dbRole = roleMapping[profileData.role] || "merchant";
      
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: dbRole });
        
      if (insertError) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to create user role", 
            details: insertError,
            role: profileData.role,
            mappedRole: dbRole
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          role: profileData.role, 
          dbRole: dbRole, 
          source: "profile", 
          message: "Role created from profile" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Map database role back to application role
    const roleMapping: Record<string, string> = {
      "admin": "admin",
      "landlord": "manager",
      "tenant": "team_lead",
      "merchant": "employee"
    };
    
    const appRole = roleMapping[roleData.role] || "employee";
    
    return new Response(
      JSON.stringify({ 
        role: appRole, 
        dbRole: roleData.role, 
        source: "user_roles" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
