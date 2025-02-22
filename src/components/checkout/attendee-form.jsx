"use client"

import PropTypes from "prop-types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  second_name: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  copyToAll: z.boolean().optional(),
})

export function AttendeeForm({ onSubmit, isLoading, orderData }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      second_name: "",
      email: "",
      copyToAll: false,
    },
  })

  const handleSubmit = (data) => {
    const attendees = []
    for (let i = 0; i < orderData.quantity; i++) {
      attendees.push({
        name: data.copyToAll ? data.name : "",
        second_name: data.copyToAll ? data.second_name : "",
        email: data.copyToAll ? data.email : "",
      })
    }
    onSubmit(attendees)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Asistente 1</h3>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del asistente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="second_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido del asistente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {orderData.quantity > 1 && (
          <FormField
            control={form.control}
            name="copyToAll"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal">Copiar detalles a todos los asistentes</FormLabel>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Completar orden"}
        </Button>
      </form>
    </Form>
  )
}

AttendeeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  orderData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
}

