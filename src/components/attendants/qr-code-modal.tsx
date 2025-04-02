"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Mail, Loader2, Check, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "../../components/ui/alert"
// Importar EmailJS
import emailjs from "@emailjs/browser"

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  attendee: any
  eventId?: string
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, attendee, eventId }) => {
  const [isSending, setIsSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    type: "success" | "error" | null
    message: string | null
  }>({ type: null, message: null })

  // Enviar correo con EmailJS
  const handleSendEmail = async () => {
    if (!attendee.email) {
      setEmailStatus({
        type: "error",
        message: "El asistente no tiene un correo electrónico registrado.",
      })
      return
    }

    try {
      setIsSending(true)
      setEmailStatus({ type: null, message: null })

      // Crear enlace para el asistente
      const attendeeLink = `http://localhost:5173/events/${eventId || attendee.event_id}`

      // Preparar los datos para el correo
      const templateParams = {
        to_email: attendee.email,
        to_name: `${attendee.name} ${attendee.second_name || ""}`.trim(),
        attendee_code: attendee.code,
        event_link: attendeeLink,
        event_name: "Tu Evento", // Puedes obtener esto de algún contexto o prop
      }

      // Enviar correo con EmailJS
      await emailjs.send(
        "service_ckfmlwl", // Reemplaza con tu Service ID
        "template_20jh7dj", // Reemplaza con tu Template ID
        templateParams,
        "pIiR9nD5kGdXBVnp7", // Reemplaza con tu clave pública de EmailJS
      )

      setEmailStatus({
        type: "success",
        message: "Correo enviado exitosamente a " + attendee.email,
      })
    } catch (error) {
      console.error("Error al enviar el correo:", error)
      setEmailStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Error al enviar el correo",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Enviar enlace - {attendee?.name} {attendee?.second_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="mt-4 text-center">
            <p className="font-medium">
              {attendee?.name} {attendee?.second_name}
            </p>
            <p className="text-sm text-gray-500">Código: {attendee?.code}</p>
            {attendee?.email && <p className="text-sm text-gray-500">{attendee.email}</p>}
            <p className="mt-4 text-sm">
              Se enviará un correo electrónico con los datos del evento y un enlace para acceder.
            </p>
          </div>
        </div>

        {emailStatus.type && (
          <Alert className={emailStatus.type === "success" ? "bg-green-50" : "bg-red-50"}>
            {emailStatus.type === "success" ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={emailStatus.type === "success" ? "text-green-800" : "text-red-800"}>
              {emailStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {attendee?.email && (
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Enviar por correo
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default QrCodeModal
