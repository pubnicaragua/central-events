// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const client = new SmtpClient()

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { to, subject, message, orderId, sendCopy } = await req.json()

    await client.connectTLS({
      hostname: Deno.env.get("SMTP_HOSTNAME"),
      port: 465,
      username: Deno.env.get("SMTP_USERNAME"),
      password: Deno.env.get("SMTP_PASSWORD"),
    })

    await client.send({
      from: Deno.env.get("SMTP_FROM"),
      to: to,
      subject: subject,
      content: message,
    })

    if (sendCopy) {
      await client.send({
        from: Deno.env.get("SMTP_FROM"),
        to: Deno.env.get("SMTP_FROM"),
        subject: `Copy: ${subject}`,
        content: message,
      })
    }

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

