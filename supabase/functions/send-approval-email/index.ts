
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { name, email, role } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Sending approval email to ${email} for role: ${role}`);
    
    // Here you would typically integrate with an email service like SendGrid
    // For now, we'll just log the action and return success
    
    console.log(`Email would be sent to ${email} with content:`);
    console.log(`
      Subject: Your TaskSync Account Has Been Approved!
      
      Hi ${name},
      
      Your TaskSync account has been approved. You have been assigned the role of ${role}.
      You can now log in using your email and password at ${req.headers.get("origin") || "our application"}.
      
      Welcome to TaskSync!
      
      Best regards,
      The TaskSync Team
    `);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Approval notification email would be sent to ${email}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-approval-email function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
