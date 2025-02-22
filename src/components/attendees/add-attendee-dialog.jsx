"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AttendeeForm } from "./attendee-form"
import { useToast } from "@/components/ui/use-toast"
import supabase from "../../api/supabase"

export function AddAttendeeDialog({ open, onOpenChange, eventId, onAttendeeCreated }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    try {
      // 1. Verificar disponibilidad de tickets
      const { data: availableTicket, error: ticketError } = await supabase
        .from("tickets")
        .select("id, price, quantity")
        .eq("event_id", eventId)
        .gt("quantity", 0)
        .order("price")
        .limit(1)
        .single()

      if (ticketError || !availableTicket) {
        throw new Error("No hay tickets disponibles para este evento")
      }

      // 2. Crear la orden
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            event_id: eventId,
            email: formData.email,
            name: formData.name,
            total: availableTicket.price,
            ticket_id: availableTicket.id,
            quantity: 1,
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // 3. Crear el asistente
      const { error: attendeeError } = await supabase.from("attendants").insert([
        {
          order_id: order.id,
          ticket_id: availableTicket.id,
          name: formData.name,
          second_name: formData.second_name,
          email: formData.email,
          code: formData.code,
          status: "confirmed",
        },
      ])

      if (attendeeError) throw attendeeError

      // 4. Actualizar la cantidad de tickets disponibles
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ quantity: availableTicket.quantity - 1 })
        .eq("id", availableTicket.id)

      if (updateError) throw updateError

      toast({
        title: "Asistente agregado",
        description: "El asistente ha sido registrado exitosamente.",
      })

      onAttendeeCreated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating attendee:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Hubo un error al crear el asistente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar asistente</DialogTitle>
          <DialogDescription>Complete los datos del asistente para registrarlo en el evento.</DialogDescription>
        </DialogHeader>
        <AttendeeForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}

