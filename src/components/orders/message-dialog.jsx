"use client"

import PropTypes from "prop-types"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import supabase from "../../api/supabase"

export function MessageDialog({ open, onOpenChange, order }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sendCopy, setSendCopy] = useState(false)
  const [sendTest, setSendTest] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!order) return null

  const handleSendMessage = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: sendTest ? order.email : order.email,
          subject: subject,
          message: message,
          orderId: order.id,
          sendCopy: sendCopy,
        },
      })

      if (error) throw error

      toast({
        title: "Mensaje enviado",
        description: "El mensaje ha sido enviado exitosamente",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar un mensaje</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Recipiente</Label>
            <Input value={`${order.name} <${order.email}>`} disabled />
          </div>

          <div>
            <Label>Sujeto</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto del mensaje" />
          </div>

          <div>
            <Label>Contenido del mensaje</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escriba su mensaje aquí..."
              className="min-h-[200px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="copy" checked={sendCopy} onCheckedChange={setSendCopy} />
            <Label htmlFor="copy">Enviar una copia a {order.email}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="test" checked={sendTest} onCheckedChange={setSendTest} />
            <Label htmlFor="test" className="flex-1">
              Enviar como prueba. Esto enviará el mensaje a su dirección de correo electrónico en lugar de a los
              destinatarios.
            </Label>
          </div>

          <Alert>
            <AlertDescription>
              ¡Antes de enviar!
              <br />
              Sólo los correos electrónicos importantes que estén directamente relacionados con este evento deben
              enviarse mediante este formulario. Cualquier uso indebido, incluido el envío de correos electrónicos
              promocionales, dará lugar a la prohibición inmediata de la cuenta.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <Switch id="confirm" checked={sendCopy} onCheckedChange={setSendCopy} />
            <Label htmlFor="confirm">
              Este correo electrónico no es promocional y está directamente relacionado con el evento.
            </Label>
          </div>

          <Button onClick={handleSendMessage} disabled={isLoading || !subject || !message} className="w-full">
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

MessageDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
}

