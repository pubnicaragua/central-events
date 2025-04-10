"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Checkbox } from "../../components/ui/checkbox"
import supabase from "../../api/supabase"

interface AgregarAsistenteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  eventId: string
  tickets: any[]
}

const AgregarAsistenteModal: React.FC<AgregarAsistenteModalProps> = ({ isOpen, onClose, onSave, eventId, tickets }) => {
  const [formData, setFormData] = useState({
    name: "",
    second_name: "",
    email: "",
    status: "no confirmado",
    ticket_id: null,
  })
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [amenities, setAmenities] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("datos")

  useEffect(() => {
    if (isOpen) {
      fetchSections()
    }
  }, [isOpen, eventId])

  useEffect(() => {
    if (selectedSection) {
      fetchAmenities(selectedSection)
    } else {
      setAmenities([])
    }
  }, [selectedSection])

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("amenities_sections")
        .select("*")
        .eq("event_id", eventId)
        .order("name", { ascending: true })

      if (error) throw error

      setSections(data || [])

      // Si hay una sección predeterminada, seleccionarla automáticamente
      const defaultSection = data?.find((section) => section.is_default)
      if (defaultSection) {
        setSelectedSection(defaultSection.id)
      }
    } catch (error) {
      console.error("Error al cargar las secciones:", error)
    }
  }

  const fetchAmenities = async (sectionId) => {
    try {
      const { data, error } = await supabase
        .from("amenities")
        .select("*")
        .eq("section_id", sectionId)
        .order("name", { ascending: true })

      if (error) throw error

      setAmenities(data || [])

      // Si la sección es predeterminada, seleccionar todas las amenidades automáticamente
      const section = sections.find((s) => s.id === sectionId)
      if (section?.is_default) {
        setSelectedAmenities(data || [])
      } else {
        setSelectedAmenities([])
      }
    } catch (error) {
      console.error("Error al cargar las amenidades:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "ticket_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "0" ? null : value,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) => {
      const isSelected = prev.some((a) => a.id === amenity.id)
      if (isSelected) {
        return prev.filter((a) => a.id !== amenity.id)
      } else {
        return [...prev, amenity]
      }
    })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      // Asegurarnos de que selectedAmenities se pasa como un array separado
      onSave({
        ...formData,
        selectedAmenities: selectedAmenities,
      })

      // Limpiar formulario
      setFormData({
        name: "",
        second_name: "",
        email: "",
        status: "no confirmado",
        ticket_id: null,
      })
      setSelectedSection(null)
      setSelectedAmenities([])
      setActiveTab("datos")
    } catch (error) {
      console.error("Error al guardar el asistente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Limpiar formulario y errores antes de cerrar
    setFormData({
      name: "",
      second_name: "",
      email: "",
      status: "no confirmado",
      ticket_id: null,
    })
    setSelectedSection(null)
    setSelectedAmenities([])
    setErrors({})
    setActiveTab("datos")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar asistente</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="datos">Datos personales</TabsTrigger>
            <TabsTrigger value="amenidades">Amenidades</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="datos" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre del asistente"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="second_name">Apellido</Label>
                <Input
                  id="second_name"
                  name="second_name"
                  value={formData.second_name}
                  onChange={handleChange}
                  placeholder="Apellido del asistente"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email del asistente"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no confirmado">No confirmado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ticket_id">Ticket</Label>
                <Select
                  value={formData.ticket_id?.toString() || "0"}
                  onValueChange={(value) => handleSelectChange("ticket_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin ticket</SelectItem>
                    {tickets.map((ticket) => (
                      <SelectItem key={ticket.id} value={ticket.id.toString()}>
                        {ticket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="amenidades" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="section">Sección de amenidades</Label>
                <Select
                  value={selectedSection?.toString() || "0"}
                  onValueChange={(value) => setSelectedSection(value === "0" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Ninguna</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name} {section.is_default ? "(Predeterminada)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSection && amenities.length > 0 ? (
                <div className="border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity.id}`}
                        checked={selectedAmenities.some((a) => a.id === amenity.id)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={`amenity-${amenity.id}`} className="flex-1 cursor-pointer">
                        {amenity.name}
                        {amenity.description && (
                          <span className="text-gray-500 text-sm block">{amenity.description}</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : selectedSection ? (
                <div className="text-center py-4 text-gray-500">No hay amenidades disponibles en esta sección</div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Selecciona una sección para ver las amenidades disponibles
                </div>
              )}
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "Guardando..." : "Guardar asistente"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AgregarAsistenteModal
