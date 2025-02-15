"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  discountType: z.string(),
  discountAmount: z.string().optional(),
  tickets: z.array(z.string()).default([]),
  expiration: z.string().optional(),
  usageLimit: z.string(),
})

const tickets = [
  { value: "vip", label: "Entrada VIP" },
  { value: "free", label: "Entrada gratis" },
]

export function CreatePromoCodeForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountType: "none",
      usageLimit: "unlimited",
      tickets: [],
    },
  })

  const [selectedTickets, setSelectedTickets] = React.useState<string[]>([])

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertTitle>CONSEJO</AlertTitle>
          <AlertDescription>
            Se puede utilizar un código de promoción sin descuento para revelar entradas ocultas.
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Código
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de descuento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin descuento</SelectItem>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="fixed">Cantidad fija</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("discountType") !== "none" && (
            <FormField
              control={form.control}
              name="discountAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descuento en USD</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-muted-foreground">$</span>
                      <Input type="number" className="pl-6" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="tickets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿A qué billetes se aplica este código?</FormLabel>
              <FormDescription>(Se aplica a todos de forma predeterminada)</FormDescription>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    if (!selectedTickets.includes(value)) {
                      const newTickets = [...selectedTickets, value]
                      setSelectedTickets(newTickets)
                      field.onChange(newTickets)
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las entradas" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tickets.map((ticket) => (
                      <SelectItem key={ticket.value} value={ticket.value}>
                        {ticket.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {selectedTickets.map((ticket) => (
                    <Badge
                      key={ticket}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        const newTickets = selectedTickets.filter((t) => t !== ticket)
                        setSelectedTickets(newTickets)
                        field.onChange(newTickets)
                      }}
                    >
                      {tickets.find((t) => t.value === ticket)?.label}
                      <span className="ml-1">×</span>
                    </Badge>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="expiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de caducidad</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="datetime-local" className="pl-8" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Cuántas veces se puede utilizar este código?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar límite" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unlimited">Ilimitado</SelectItem>
                    <SelectItem value="once">Una vez</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Crear código promocional
        </Button>
      </form>
    </Form>
  )
}

