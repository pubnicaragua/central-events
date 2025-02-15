"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  question: z.string().min(1, "La pregunta es requerida"),
})

export default function QuestionsPage() {
  const [open, setOpen] = React.useState(false)
  const [questionType, setQuestionType] = React.useState<"order" | "attendee">("order")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      question: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    setOpen(false)
    form.reset()
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Preguntas</h1>
      </div>

      <div className="flex items-center justify-between border-b pb-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar pregunta
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {questionType === "order" ? "Preguntas sobre pedidos" : "Preguntas de los asistentes"}
              </SheetTitle>
              <SheetDescription>Agregue una nueva pregunta para recopilar información adicional.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nombre de pila
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de pila" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Apellido
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Apellido" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Dirección de correo electrónico
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Dirección de correo electrónico" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Pregunta
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Escriba su pregunta aquí" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Agregar pregunta
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
        <Badge variant="secondary">0 preguntas ocultas</Badge>
      </div>

      <div className="grid gap-8">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Preguntas sobre pedidos</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuestionType("order")
                setOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No tienes preguntas sobre pedidos.
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Preguntas de los asistentes</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuestionType("attendee")
                setOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No tienes preguntas de los asistentes.
          </div>
        </section>
      </div>
    </div>
  )
}

