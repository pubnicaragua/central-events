"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { TicketForm } from "./ticket-form"
import { updateTicket, updateEscaledTicket, deleteEscaledTicket, createEscaledTicket }  from "../lib/actions/tickets"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  type: z.enum(["paid", "free", "donation", "tiered"]),
  price: z
    .string()
    .optional()
    .refine((val) => {
      if (val === undefined) return true
      const num = Number.parseFloat(val)
      return !isNaN(num) && num >= 0
    }, "El precio debe ser un número positivo"),
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
  priceLevels: z
    .array(
      z.object({
        id: z.number().optional(),
        price: z.string().min(1, "El precio es requerido"),
        tag: z.string().min(1, "La etiqueta es requerida"),
        quantity: z.string(),
      }),
    )
    .optional(),
})

export function EditTicketDialog({ open, onOpenChange, onTicketUpdated, ticket, escaledTickets }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ticket.title,
      description: ticket.description,
      type: ticket.bill_type,
      price: ticket.price.toString(),
      quantity: ticket.quantity ? ticket.quantity.toString() : "unlimited",
      minQuantity: ticket.min_per_order.toString(),
      maxQuantity: ticket.max_per_order.toString(),
      startDate: new Date(ticket.begin_date).toISOString().split("T")[0],
      endDate: new Date(ticket.end_date).toISOString().split("T")[0],
      hideBeforeStart: ticket.hide_before_sale,
      hideAfterEnd: ticket.hide_after_sale,
      hideWhenSoldOut: ticket.hide_if_spent,
      showQuantity: ticket.show_quantity,
      hideFromCustomers: ticket.hide_to_clients,
      priceLevels: escaledTickets
        ? escaledTickets.map((et) => ({
            id: et.id,
            price: et.price.toString(),
            tag: et.level_name,
            quantity: et.quantity ? et.quantity.toString() : "unlimited",
          }))
        : [],
    },
  })

  useEffect(() => {
    form.reset({
      name: ticket.title,
      description: ticket.description,
      type: ticket.bill_type,
      price: ticket.price.toString(),
      quantity: ticket.quantity ? ticket.quantity.toString() : "unlimited",
      minQuantity: ticket.min_per_order.toString(),
      maxQuantity: ticket.max_per_order.toString(),
      startDate: new Date(ticket.begin_date).toISOString().split("T")[0],
      endDate: new Date(ticket.end_date).toISOString().split("T")[0],
      hideBeforeStart: ticket.hide_before_sale,
      hideAfterEnd: ticket.hide_after_sale,
      hideWhenSoldOut: ticket.hide_if_spent,
      showQuantity: ticket.show_quantity,
      hideFromCustomers: ticket.hide_to_clients,
      priceLevels: escaledTickets
        ? escaledTickets.map((et) => ({
            id: et.id,
            price: et.price.toString(),
            tag: et.level_name,
            quantity: et.quantity ? et.quantity.toString() : "unlimited",
          }))
        : [],
    })
  }, [ticket, escaledTickets, form])

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      const ticketData = {
        title: values.name,
        description: values.description,
        bill_type: values.type,
        quantity: values.quantity === "unlimited" ? null : Number.parseInt(values.quantity),
        price: values.type === "free" ? 0 : Number.parseFloat(values.price || "0"),
        min_per_order: Number.parseInt(values.minQuantity),
        max_per_order: Number.parseInt(values.maxQuantity),
        begin_date: new Date(values.startDate).toISOString(),
        end_date: new Date(values.endDate).toISOString(),
        hide_before_sale: values.hideBeforeStart,
        hide_after_sale: values.hideAfterEnd,
        hide_if_spent: values.hideWhenSoldOut,
        show_quantity: values.showQuantity,
        hide_to_clients: values.hideFromCustomers,
      }

      await updateTicket(ticket.id, ticketData)

      if (values.type === "tiered" && values.priceLevels) {
        const existingIds = new Set(escaledTickets.map((et) => et.id))
        for (const level of values.priceLevels) {
          const escaledTicketData = {
            level_name: level.tag,
            price: Number.parseFloat(level.price),
            quantity: level.quantity === "unlimited" ? null : Number.parseInt(level.quantity),
            begin_date: new Date(values.startDate).toISOString(),
            end_date: new Date(values.endDate).toISOString(),
            hide_to_user: values.hideFromCustomers,
            ticket_id: ticket.id,
          }

          if (level.id) {
            await updateEscaledTicket(level.id, escaledTicketData)
            existingIds.delete(level.id)
          } else {
            await createEscaledTicket(escaledTicketData)
          }
        }

        // Delete removed price levels
        for (const id of existingIds) {
          await deleteEscaledTicket(id)
        }
      }

      onTicketUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error al actualizar el ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Editar Ticket</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TicketForm control={form.control} watch={form.watch} />
            <DialogFooter>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

EditTicketDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onTicketUpdated: PropTypes.func.isRequired,
  ticket: PropTypes.object.isRequired,
  escaledTickets: PropTypes.array,
}

