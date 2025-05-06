"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Mail, Loader2, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "../../components/ui/alert"
import QRCode from "qrcode"
import supabase from "../../api/supabase"

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
      setEmailStatus({ type: "error", message: "El asistente no tiene un correo electrónico registrado." })
      return
    }

    try {
      // Verificar el límite de 300 correos
      const { data: notifiedData, error: countError } = await supabase
        .from("attendants")
        .select("id")
        .eq("event_id", eventId || attendee.event_id)
        .eq("notificated", true)

      if (countError) {
        throw new Error("Error al verificar el límite de correos")
      }

      const currentNotifiedCount = notifiedData?.length || 0

      // Verificar si ya se alcanzó el límite
      if (currentNotifiedCount >= 300) {
        setEmailStatus({
          type: "error",
          message: "Tu configuración actual solo permite 300 correos al día.",
        })
        return
      } else if (attendee.notificated) {
        setEmailStatus({
          type: "error",
          message: `Este asistente ya fue notificado anteriormente.`,
        })
        return
      }

      setIsSending(true)
      setEmailStatus({ type: null, message: null })
      const attendeeLink = `https://passkevents.com/events/${eventId || attendee.event_id}?attendeeId=${attendee.id}`

      const qrPayload = {
        attendeeId: attendee.id,
        eventId: String(eventId || attendee.event_id),
        code: attendee.code,
        name: `${attendee.name} ${attendee.second_name || ""}`.trim(),
      }

      console.log(qrPayload)

      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload))

      const res = await fetch("https://beckfiitgbfzrkrmkrro.supabase.co/functions/v1/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlY2tmaWl0Z2JmenJrcm1rcnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODMxNzIsImV4cCI6MjA1NDk1OTE3Mn0.XNVBOWP5WywfcddLjtsbDUi_f-RR4M0ij1MKg2D-Wqg`,
        },
        body: JSON.stringify({
          to_email: attendee.email,
          to_name: `${attendee.name} ${attendee.second_name || ""}`.trim(),
          attendee_code: attendee.code,
          qr_image: qrDataUrl,
          event_link: attendeeLink,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || "Error al enviar el correo.")
      }

      // Actualizar el campo notificated a true
      const { error: updateError } = await supabase
        .from("attendants")
        .update({ notificated: true })
        .eq("id", attendee.id)

      if (updateError) {
        console.error("Error al actualizar estado de notificación:", updateError)
      }

      setEmailStatus({
        type: "success",
        message: `Correo enviado exitosamente a ${attendee.email}`,
      })
    } catch (error) {
      console.error("Error al enviar el correo:", error)
      setEmailStatus({ type: "error", message: error instanceof Error ? error.message : "Error al enviar el correo" })
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
