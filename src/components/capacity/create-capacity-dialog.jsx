"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { createCapacityAssignment } from "@actions/capacity"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  capacity: z.string(),
  tickets: z.array(z.string()).min(1, "Debes seleccionar al menos un ticket"),
  status: z.enum(["active", "inactive"]),
})

export function CreateCapacityDialog({ open, onOpenChange, onCapacityCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      capacity: "unlimited",
      status: "active",
      tickets: [],
    },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      await createCapacityAssignment({
        name: values.name,
        capacity: values.capacity === "unlimited" ? null : Number.parseInt(values.capacity),
        status: values.status,
        tickets: values.tickets,
      })
      onCapacityCreated()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error al crear la asignación de capacidad:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Crear Asignación de Capacidad</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Capacidad del primer día" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidad</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar capacidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unlimited">Ilimitado</SelectItem>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <SelectItem key={i + 1} value={String((i + 1) * 100)}>
                          {(i + 1) * 100}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿A qué billetes debería aplicarse esta capacidad?</FormLabel>
                  <Select onValueChange={(value) => field.onChange([...field.value, value])} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar boletos" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ticket-1">Entrada doble</SelectItem>
                      <SelectItem value="ticket-2">Entrada VIP</SelectItem>
                      <SelectItem value="ticket-3">Entrada General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">
                        Activo
                        <span className="block text-xs text-muted-foreground">
                          Activa esta capacidad para detener la venta de entradas cuando se alcance el límite
                        </span>
                      </SelectItem>
                      <SelectItem value="inactive">
                        Inactivo
                        <span className="block text-xs text-muted-foreground">
                          Deshabilitar esta capacidad rastreará las ventas, pero no las detendrá cuando se alcance el
                          límite
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Asignación de Capacidad"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

CreateCapacityDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onCapacityCreated: PropTypes.func.isRequired,
}

