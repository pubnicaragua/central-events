"use client"
import PropTypes from "prop-types";
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createTicket, createEscaledTicket } from "../../utils/ticketActions"

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["paid", "tiered"]),
  price: z.string().optional(),
  quantity: z.enum(["ilimitado", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]),
  minQuantity: z.string().min(1),
  maxQuantity: z.string().min(1),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha inválida",
    })
    .transform((val) => new Date(val)),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha inválida",
    })
    .transform((val) => new Date(val)),
  hideBeforeStart: z.boolean(),
  hideAfterEnd: z.boolean(),
  hideWhenSoldOut: z.boolean(),
  showQuantity: z.boolean(),
  hideFromCustomers: z.boolean(),
})

export function CreateTicketDialog({ open, onOpenChange, onTicketCreated, eventId }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "paid",
      quantity: "ilimitado",
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
        // Crear un ticket escalonado
        await createEscaledTicket({
          level_name: values.name,
          price: Number.parseFloat(values.price || "0"),
          quantity: values.quantity === "ilimitado" ? null : Number.parseInt(values.quantity),
          begin_date: values.startDate,
          end_date: values.endDate,
          hide_to_user: values.hideFromCustomers,
        })
      } else {
        // Crear un ticket normal
        await createTicket({
          title: values.name,
          description: values.description,
          status: "active",
          bill_type: values.type,
          quantity: values.quantity === "ilimitado" ? null : Number.parseInt(values.quantity),
          price: Number.parseFloat(values.price || "0"),
          min_per_order: Number.parseInt(values.minQuantity),
          max_per_order: Number.parseInt(values.maxQuantity),
          begin_date: values.startDate,
          end_date: values.endDate,
          hide_before_sale: values.hideBeforeStart,
          hide_after_sale: values.hideAfterEnd,
          hide_if_spent: values.hideWhenSoldOut,
          show_quantity: values.showQuantity,
          hide_to_clients: values.hideFromCustomers,
          event_id: eventId
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Ticket</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del ticket" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción del ticket" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Ticket</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paid" id="paid" />
                        <Label htmlFor="paid">Pago único</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tiered" id="tiered" />
                        <Label htmlFor="tiered">Escalonado</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Precio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ilimitado">Ilimitado</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad mínima por orden</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Cantidad mínima" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad máxima por orden</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Cantidad máxima" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de inicio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de fin</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hideBeforeStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocultar antes de la fecha de inicio</FormLabel>
                  <FormControl>
                    <Switch {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hideAfterEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocultar después de la fecha de fin</FormLabel>
                  <FormControl>
                    <Switch {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hideWhenSoldOut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocultar cuando se agoten</FormLabel>
                  <FormControl>
                    <Switch {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mostrar cantidad</FormLabel>
                  <FormControl>
                    <Switch {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hideFromCustomers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocultar a los clientes</FormLabel>
                  <FormControl>
                    <Switch {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
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
};
