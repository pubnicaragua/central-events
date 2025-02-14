"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateEvent } from "../../utils/eventsActions"
import supabase from "../../api/supabase"

export function BasicDetailsForm() {
  const { eventId } = useParams()
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEventData() {
      try {
        const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

        if (error) throw error

        const formattedStartDate = data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : ""
        const formattedEndDate = data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : ""

        setEventData({
          name: data.name || "",
          description: data.description || "",
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching event data:", error)
        setError("Failed to load event data")
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateEvent(eventId, eventData)
      alert("Evento actualizado exitosamente!")
    } catch (error) {
      console.error("Error updating event:", error)
      alert("Error al actualizar el evento")
    }
  }

  if (loading) return <div>Cargando...</div>
  if (error) return <div>{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles básicos</CardTitle>
        <CardDescription>Actualizar el nombre del evento, la descripción y las fechas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={eventData.name}
              onChange={handleInputChange}
              placeholder="Nombre del evento"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleInputChange}
              placeholder="Describe tu evento..."
              className="min-h-[100px] resize-y"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Fecha de inicio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                value={eventData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">
                Fecha final <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                value={eventData.end_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <Button type="submit" className="mt-4">
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

