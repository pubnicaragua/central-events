import { createClient } from "@supabase/supabase-js"

// Definir tipos para los parámetros de envío de correo
export interface SendEmailParams {
    to: string
    subject: string
    html: string
    attachments?: Array<{
        filename: string
        content: string // Base64 encoded content
        contentType: string
    }>
}

// Función para enviar correo usando Resend a través de una función serverless
export async function sendEmail({ to, subject, html, attachments = [] }: SendEmailParams) {
    try {
        // Verificar que el correo destino sea válido
        if (!to || !validateEmail(to)) {
            throw new Error("Dirección de correo inválida")
        }

        // Crear URL para la API de Resend
        const apiUrl = process.env.NEXT_PUBLIC_EMAIL_API_URL || "https://api.resend.com/emails"

        // Preparar datos para la solicitud
        const emailData = {
            from: "Eventos App <noreply@tudominio.com>",
            to,
            subject,
            html,
            attachments,
        }

        // Enviar solicitud a la API
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_RESEND_API_KEY || ""}`,
            },
            body: JSON.stringify(emailData),
        })

        // Verificar respuesta
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Error al enviar correo: ${errorData.message || response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Error en el servicio de correo:", error)
        throw error
    }
}

// Función para validar formato de correo electrónico
function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

// Función para crear una API serverless con Supabase Edge Functions
export async function setupEmailServerless(supabaseUrl: string, supabaseKey: string) {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Aquí podrías configurar una Edge Function en Supabase
    // Este es solo un ejemplo conceptual, necesitarías implementar la Edge Function en Supabase
    console.log("Configurando servicio de correo con Supabase Edge Functions")

    return {
        sendEmail: async (params: SendEmailParams) => {
            // En una implementación real, llamarías a tu Edge Function
            return sendEmail(params)
        },
    }
}

