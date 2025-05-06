// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import nodemailer from "npm:nodemailer"
import QRCode from "npm:qrcode"

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Manejar preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { to_email, to_name, attendee_code, event_link } = await req.json()

    // Generate QR code as PNG data URL
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({
        attendeeId: "123",
        eventId: "456",
        code: attendee_code,
        name: to_name,
      }),
      { type: "png" },
    )

    // Extract base64 data from the data URL
    const qrCodeBase64 = qrDataUrl.split(",")[1]

    const template = `<!DOCTYPE html>
<html>
<head>
  <title>Tu enlace para el evento</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #333; text-align: center; margin-top: 0;">Tu acceso para el evento</h2>
      <p>Hola {{to_name}},</p>
      <p>Has sido invitado a nuestro evento. A continuación encontrarás tu código de acceso, un código QR y un enlace directo al evento.</p>
      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
        <p style="font-weight: bold; margin-bottom: 10px;">Tu código de acceso:</p>
        <p style="font-family: monospace; font-size: 18px; background: #e9e9e9; padding: 8px; display: inline-block; border-radius: 4px;">
          {{attendee_code}}
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-weight: bold;">O presenta este código QR:</p>
        <img src="cid:qrCode" alt="Código QR" width="200" height="200" style="margin-top: 10px;" />
        <p style="margin-top: 10px;">Si la imagen no se muestra, <a href="{{qr_image}}">haz clic aquí</a> para ver el código QR.</p>
      </div>
      <div style="text-align: center; margin: 25px 0;">
        <a href="{{event_link}}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">
          Acceder al Evento
        </a>
      </div>
      <p>Instrucciones:</p>
      <ol style="margin-bottom: 20px;">
        <li>Guarda este correo con tu código de acceso y QR</li>
        <li>Haz clic en el botón "Acceder al Evento" o escanea el código QR</li>
        <li>Introduce tu código cuando se te solicite</li>
        <li>¡Disfruta del evento!</li>
      </ol>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p style="margin-top: 30px;">Saludos,<br>El equipo organizador</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>Este es un correo automático, por favor no responder.</p>
    </div>
  </div>
</body>
</html>`

    const htmlWithData = template
      .replace("{{to_name}}", to_name)
      .replace("{{attendee_code}}", attendee_code)
      .replace("{{event_link}}", event_link)
      .replace("{{qr_image}}", qrDataUrl)

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "equipo@passkevents.com",
        pass: "@passk,20,25*Events",
      },
    })

    await transporter.sendMail({
      from: `"PassK Events" <equipo@passkevents.com>`,
      to: to_email,
      subject: `Tu acceso al evento`,
      html: htmlWithData,
      attachments: [
        {
          filename: `qrCode-${attendee_code}.png`, // Unique filename
          content: qrCodeBase64,
          encoding: "base64",
          contentType: "image/png",
          contentDisposition: "inline",
          cid: "qrCode",
        },
      ],
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 500,
    })
  }
})
