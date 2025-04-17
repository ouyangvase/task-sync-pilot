
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  name: string;
  email: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role }: ApprovalEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "TaskSync Pilot <onboarding@resend.dev>",
      to: [email],
      subject: "Your TaskSync Pilot Account has been Approved!",
      html: `
        <h1>Welcome to TaskSync Pilot, ${name}!</h1>
        <p>Your account has been approved by an administrator.</p>
        <p>You have been assigned the role of: <strong>${role}</strong></p>
        <p>You can now log in to your account and start using TaskSync Pilot.</p>
        <p>Best regards,<br>The TaskSync Pilot Team</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
