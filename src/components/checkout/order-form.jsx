"use client"

import PropTypes from "prop-types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  second_name: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  quantity: z
    .number()
    .min(1, "La cantidad debe ser mayor a 0")
    .refine((val) => val > 0, "La cantidad debe ser mayor a 0"),
})

export function OrderForm({ onSubmit, isLoading, maxQuantity }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      second_name: "",
      email: "",
      quantity: 1,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
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
                <Input placeholder="Tu apellido" {...field} />
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
                <Input type="email" placeholder="tu@email.com" {...field} />
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
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max={maxQuantity || undefined}
                  {...field}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                />
              </FormControl>
              {maxQuantity && <p className="text-sm text-muted-foreground">Máximo {maxQuantity} tickets disponibles</p>}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Continuar"}
        </Button>
      </form>
    </Form>
  )
}

OrderForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  maxQuantity: PropTypes.number,
}

