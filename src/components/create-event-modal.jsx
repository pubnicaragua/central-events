"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createEvent } from "../utils/eventsActions"
import { toast } from "sonner"

export function CreateEventModal({ open, setOpen, organizers, onEventCreated }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    organizerId: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value) => {
    setFormData({ ...formData, organizerId: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validar que todos los campos requeridos estén llenos
    if (!formData.organizerId || !formData.name || !formData.startDate || !formData.endDate) {
      setError("Todos los campos marcados con * son obligatorios.")
      setLoading(false)
      return
    }

    try {
      const newEvent = await createEvent({
        organizer_id: formData.organizerId,
        name: formData.name,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: "Próximo",
      })

      toast.success("¡Evento creado exitosamente!")
      setOpen(false)

      // Redirigir a getting-started con la información del evento
      navigate("/getting-started", {
        state: {
          eventId: newEvent.id,
          eventName: newEvent.name,
        },
      })

      setFormData({
        organizerId: "",
        name: "",
        description: "",
        startDate: "",
        endDate: "",
      })

      if (onEventCreated) {
        onEventCreated()
      }
    } catch (error) {
      setError("Error al guardar el evento. Intenta de nuevo.")
      console.error("Error creando el evento:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Crear evento</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                ¿Quién organiza este evento? <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.organizerId} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un organizador" />
                </SelectTrigger>
                <SelectContent>
                  {organizers?.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                name="name"
                placeholder="Ej: Hola.Eventos Conferencia 2025"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                name="description"
                className="min-h-[100px]"
                placeholder="Describe tu evento..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Fecha de inicio <span className="text-red-500">*</span>
                </Label>
                <Input name="startDate" type="datetime-local" value={formData.startDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>
                  Fecha final <span className="text-red-500">*</span>
                </Label>
                <Input name="endDate" type="datetime-local" value={formData.endDate} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Continuar configuración del evento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

