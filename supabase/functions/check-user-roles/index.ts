
// Edge Function to check user roles
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map database role to application role
function mapDbRoleToAppRole(dbRole: string): string {
  switch(dbRole) {
    case 'admin':
      return 'admin'; // This one is the same
    case 'landlord':
      return 'manager'; // Map landlord to manager
    case 'tenant':
      return 'team_lead'; // Map tenant to team_lead
    case 'merchant':
    default:
      return 'employee'; // Map merchant to employee
  }
}

// Map application role to database role
function mapAppRoleToDbRole(appRole: string): string {
  switch(appRole) {
    case 'admin':
      return 'admin'; // This one is the same
    case 'manager':
      return 'landlord'; // Map manager to landlord
    case 'team_lead':
      return 'tenant'; // Map team_lead to tenant
    case 'employee':
    default:
      return 'merchant'; // Map employee to merchant
  }
}

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
      
      // Create role mapping from app_role to database role
      const dbRole = mapAppRoleToDbRole(profileData.role);
      
      // Add user role if missing
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
    
    // Map database role to application role
    const appRole = mapDbRoleToAppRole(roleData.role);
    
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
