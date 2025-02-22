"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { TicketTypeSelector } from "./ticket-type-selector"
import { TicketForm } from "./ticket-form"
import { createTicket, createEscaledTicket } from "../lib/actions/tickets"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  type: z.enum(["paid", "free", "donation", "tiered"]),
  price: z.string().optional(),
  quantity: z.string(),
  minQuantity: z.string(),
  maxQuantity: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  hideBeforeStart: z.boolean(),
  hideAfterEnd: z.boolean(),
  hideWhenSoldOut: z.boolean(),
  showQuantity: z.boolean(),
  hideFromCustomers: z.boolean(),
  taxes: z.string().optional(),
})

export function CreateTicketDialog({ open, onOpenChange, onTicketCreated, eventId }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "paid",
      quantity: "unlimited",
      minQuantity: "1",
      maxQuantity: "100",
      hideBeforeStart: false,
      hideAfterEnd: false,
      hideWhenSoldOut: false,
      showQuantity: false,
      hideFromCustomers: false,
    },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      if (values.type === "tiered") {
        await createEscaledTicket({
          level_name: values.name,
          price: Number.parseFloat(values.price || "0"),
          quantity: values.quantity === "unlimited" ? null : Number.parseInt(values.quantity),
          begin_date: new Date(values.startDate),
          end_date: new Date(values.endDate),
          hide_to_user: values.hideFromCustomers,
          event_id: eventId, // Asegúrate de incluir el event_id aquí también
        })
      } else {
        await createTicket({
          title: values.name,
          description: values.description,
          status: "active",
          bill_type: values.type,
          quantity: values.quantity === "unlimited" ? null : Number.parseInt(values.quantity),
          price: Number.parseFloat(values.price || "0"),
          min_per_order: Number.parseInt(values.minQuantity),
          max_per_order: Number.parseInt(values.maxQuantity),
          begin_date: new Date(values.startDate),
          end_date: new Date(values.endDate),
          hide_before_sale: values.hideBeforeStart,
          hide_after_sale: values.hideAfterEnd,
          hide_if_spent: values.hideWhenSoldOut,
          show_quantity: values.showQuantity,
          hide_to_clients: values.hideFromCustomers,
          event_id: eventId,
        })
      }
      onTicketCreated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error al crear el ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Crear Ticket</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TicketTypeSelector value={form.watch("type")} onChange={(value) => form.setValue("type", value)} />
            <TicketForm control={form.control} />
            <DialogFooter>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

CreateTicketDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onTicketCreated: PropTypes.func.isRequired,
  eventId: PropTypes.string.isRequired,
}

