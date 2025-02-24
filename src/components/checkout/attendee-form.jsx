"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { AmenitiesForm } from "./amenities-form"
import { createAttendee } from "@actions/attendees"
import { useParams } from "react-router-dom"

const attendeeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  second_name: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
})

const formSchema = z.object({
  attendees: z.array(attendeeSchema),
  copyToAll: z.boolean().optional(),
})

export function AttendeeForm({ onSubmit, isLoading, quantity, ticketId, orderId }) {
  const [currentStep, setCurrentStep] = useState("details") // "details" | "amenities"
  const [currentAttendeeIndex, setCurrentAttendeeIndex] = useState(0)
  const [createdAttendees, setCreatedAttendees] = useState([])
  const [error, setError] = useState(null)
  const {eventId} = useParams();

  console.log("Event ID: ", eventId)  

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attendees: Array(quantity).fill({
        name: "",
        second_name: "",
        email: "",
      }),
      copyToAll: false,
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "attendees",
  })

  const handleCopyToAll = (data) => {
    if (data.copyToAll) {
      const firstAttendee = data.attendees[0]
      const updatedAttendees = data.attendees.map(() => ({
        ...firstAttendee,
      }))
      form.setValue("attendees", updatedAttendees)
    }
  }

  const handleDetailsSubmit = async (data) => {
    try {
      setError(null)
      // Create all attendees first
      const attendeePromises = data.attendees.map((attendee) =>
        createAttendee({
          ticket_id: ticketId,
          order_id: orderId,
          name: attendee.name,
          second_name: attendee.second_name,
          email: attendee.email,
          event_id: eventId,
        }),
      )

      const createdAttendeeData = await Promise.all(attendeePromises)
      console.log("Created attendees:", createdAttendeeData) // Debug log

      setCreatedAttendees(createdAttendeeData)
      setCurrentStep("amenities")
    } catch (err) {
      console.error("Error creating attendees:", err)
      setError("Error al crear los asistentes. Por favor, inténtalo de nuevo.")
    }
  }

  const handleAmenitiesComplete = () => {
    if (currentAttendeeIndex < createdAttendees.length - 1) {
      setCurrentAttendeeIndex((prev) => prev + 1)
    } else {
      onSubmit(createdAttendees)
    }
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>
  }

  if (currentStep === "amenities" && createdAttendees.length > 0) {
    const currentAttendee = createdAttendees[currentAttendeeIndex]
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Seleccionar amenidades - Asistente {currentAttendeeIndex + 1}</h3>
          <span className="text-sm text-muted-foreground">
            {currentAttendeeIndex + 1} de {createdAttendees.length}
          </span>
        </div>
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="font-medium">
            {currentAttendee.name} {currentAttendee.second_name}
          </p>
          <p className="text-sm text-muted-foreground">{currentAttendee.email}</p>
        </div>
        <AmenitiesForm
          eventId={String(eventId)}
          attendeeId={String(currentAttendee.id)}
          onComplete={handleAmenitiesComplete}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Asistente {index + 1}</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`attendees.${index}.name`}
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
                  name={`attendees.${index}.second_name`}
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
                  name={`attendees.${index}.email`}
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
            </CardContent>
          </Card>
        ))}

        {quantity > 1 && (
          <FormField
            control={form.control}
            name="copyToAll"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      handleCopyToAll({ ...form.getValues(), copyToAll: checked })
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">Copiar detalles a todos los asistentes</FormLabel>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Continuar con amenidades"}
        </Button>
      </form>
    </Form>
  )
}

AttendeeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  quantity: PropTypes.number.isRequired,
  eventId: PropTypes.string.isRequired,
  ticketId: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
}

