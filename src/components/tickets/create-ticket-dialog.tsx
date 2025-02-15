"use client"
import { Calendar, Ticket } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const ticketTypes = [
  {
    id: "paid",
    title: "Boleto pagado",
    description: "Billete estándar con precio fijo.",
    icon: Ticket,
  },
  {
    id: "free",
    title: "Boleto gratis",
    description: "Entrada gratuita, no se requiere información de pago.",
    icon: Ticket,
  },
  {
    id: "donation",
    title: "Donación / Pague la entrada que desee",
    description: "Fijar un precio mínimo y dejar que los usuarios paguen más si lo desean.",
    icon: Ticket,
  },
  {
    id: "tiered",
    title: "Boleto escalonado",
    description: "Múltiples opciones de precios. Perfecto para entradas anticipadas, etc.",
    icon: Ticket,
  },
]

const formSchema = z.object({
  type: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.string().optional(),
  quantity: z.string(),
  minQuantity: z.string(),
  maxQuantity: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hideBeforeStart: z.boolean().default(false),
  hideAfterEnd: z.boolean().default(false),
  hideWhenSoldOut: z.boolean().default(false),
  showQuantity: z.boolean().default(false),
  hideFromCustomers: z.boolean().default(false),
})

export function CreateTicketDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Crear Ticket</DialogTitle>
              <DialogDescription>Crea un nuevo tipo de entrada para tu evento</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de billete</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      {ticketTypes.map((type) => (
                        <Label
                          key={type.id}
                          htmlFor={type.id}
                          className={cn(
                            "flex cursor-pointer items-start space-x-4 rounded-lg border bg-card p-4 hover:bg-accent",
                            field.value === type.id && "border-primary",
                          )}
                        >
                          <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{type.title}</p>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Entrada VIP" {...field} />
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
                      <Textarea placeholder="Describe los beneficios y detalles de este tipo de entrada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("type") !== "free" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{form.watch("type") === "donation" ? "Precio mínimo" : "Precio"}</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad disponible</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una cantidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ilimitado">Ilimitado</SelectItem>
                            <SelectItem value="limitado">Limitado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mínimo por pedido</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <FormLabel>Máximo por pedido</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio de la venta</FormLabel>
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de finalización de la venta</FormLabel>
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
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Visibilidad</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hideBeforeStart"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Ocultar boleto antes de la fecha de inicio de venta</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hideAfterEnd"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Ocultar boleto después de la fecha de finalización de la venta</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hideWhenSoldOut"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Ocultar entrada cuando esté agotada</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="showQuantity"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Mostrar cantidad de entradas disponibles</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hideFromCustomers"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Ocultar este ticket a los clientes</FormLabel>
                          <FormDescription>
                            Esto anula todas las configuraciones de visibilidad y ocultará el ticket a todos los
                            clientes.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                Crear Ticket
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

