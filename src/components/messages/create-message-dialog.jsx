"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import supabase from "../../api/supabase"

export function CreateMessageDialog({ open, onOpenChange, eventId, onMessageSent }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    topic: "",
    content: "",
    recipient: "all", // 'all' o ID del asistente específico
  })
  const [attendees, setAttendees] = useState([])
  const { toast } = useToast()

  const fetchAttendees = async () => {
    try {
      const { data: orders } = await supabase.from("orders").select("id").eq("event_id", eventId)

      if (orders && orders.length > 0) {
        const { data: attendeesData } = await supabase
          .from("attendants")
          .select("id, name, email")
          .in(
            "order_id",
            orders.map((order) => order.id),
          )

        setAttendees(attendeesData || [])
      }
    } catch (error) {
      console.error("Error fetching attendees:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const messageData = {
        event_id: eventId,
        topic: formData.topic,
        content: formData.content,
        created_at: new Date().toISOString(),
      }

      if (formData.recipient !== "all") {
        messageData.attendant_id = formData.recipient
      }

      const { error } = await supabase.from("messages").insert([messageData])

      if (error) throw error

      toast({
        title: "Mensaje enviado",
        description: "El mensaje ha sido enviado exitosamente.",
      })

      onMessageSent()
      onOpenChange(false)
      setFormData({ topic: "", content: "", recipient: "all" })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar mensaje</DialogTitle>
          <DialogDescription>Envíe un mensaje a todos los asistentes o a un asistente específico.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Destinatario</Label>
            <Select
              value={formData.recipient}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, recipient: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el destinatario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los asistentes</SelectItem>
                {attendees.map((attendee) => (
                  <SelectItem key={attendee.id} value={attendee.id}>
                    {attendee.name} ({attendee.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="topic">Tema</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
              placeholder="Asunto del mensaje"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Mensaje</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Escriba su mensaje aquí..."
              className="min-h-[200px]"
            />
          </div>
          <Button type="submit" disabled={isLoading || !formData.topic || !formData.content}>
            {isLoading ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

