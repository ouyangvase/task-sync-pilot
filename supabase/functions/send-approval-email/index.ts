
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, role } = await req.json();
    console.log("Sending approval email to:", email, name, role);

    const { data, error } = await resend.emails.send({
      from: 'TaskSync <onboarding@resend.dev>',
      to: [email],
      subject: 'Your account has been approved!',
      html: `
        <h1>Welcome to TaskSync, ${name}!</h1>
        <p>Your account has been approved with the role of ${role}.</p>
        <p>You can now log in to your account and start using TaskSync.</p>
        <p>Best regards,<br>The TaskSync Team</p>
      `
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error sending approval email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
