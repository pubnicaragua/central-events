"use client"

import supabase from "../../api/supabase"
import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Checkbox } from "../../components/ui/checkbox"

interface EditarAsistenteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  attendee: any
  eventId: string
  tickets: any[]
}

const EditarAsistenteModal: React.FC<EditarAsistenteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  attendee,
  eventId,
  tickets,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    second_name: "",
    email: "",
    checked_in: false,
    ticket_id: null,
  })
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [amenities, setAmenities] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("datos")
  const [attendeeAmenities, setAttendeeAmenities] = useState([])

  useEffect(() => {
    if (isOpen && attendee) {
      setFormData({
        name: attendee.name || "",
        second_name: attendee.second_name || "",
        email: attendee.email || "",
        checked_in: attendee.checked_in || false,
        ticket_id: attendee.ticket_id || null,
      })

      fetchSections()
      fetchAttendeeAmenities()
    }
  }, [isOpen, attendee])

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
    } catch (error) {
      console.error("Error al cargar las secciones:", error)
    }
  }

  const fetchAttendeeAmenities = async () => {
    try {
      const { data, error } = await supabase
        .from("amenities_attendees")
        .select(`
          amenitie_id,
          amenities (
            id,
            name,
            description,
            price,
            section_id
          )
        `)
        .eq("attendee_id", attendee.id)

      if (error) throw error

      const amenitiesData = data.map((item) => item.amenities)
      setAttendeeAmenities(amenitiesData)
      setSelectedAmenities(amenitiesData)

      // Si hay amenidades, seleccionar la sección de la primera
      if (amenitiesData.length > 0 && amenitiesData[0].section_id) {
        setSelectedSection(amenitiesData[0].section_id)
      }
    } catch (error) {
      console.error("Error al cargar las amenidades del asistente:", error)
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

      // Mantener seleccionadas las amenidades que ya tenía el asistente
      const updatedSelected = selectedAmenities.filter((a) => !data.some((newA) => newA.id === a.id))

      setSelectedAmenities([
        ...updatedSelected,
        ...data.filter((a) => attendeeAmenities.some((attA) => attA.id === a.id)),
      ])
    } catch (error) {
      console.error("Error al cargar las amenidades:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "checked_in") {
      setFormData((prev) => ({ ...prev, [name]: value === "true" }))
    } else if (name === "ticket_id") {
      setFormData((prev) => ({ ...prev, [name]: value === "null" ? null : Number.parseInt(value) }))
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
      onSave({
        ...formData,
        selectedAmenities,
      })

      setActiveTab("datos")
    } catch (error) {
      console.error("Error al guardar el asistente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar asistente</DialogTitle>
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
                <Label htmlFor="checked_in">Check-in</Label>
                <Select
                  value={formData.checked_in?.toString()}
                  onValueChange={(value) => handleSelectChange("checked_in", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Confirmado</SelectItem>
                    <SelectItem value="false">No confirmado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ticket_id">Ticket</Label>
                <Select
                  value={formData.ticket_id?.toString() || "null"}
                  onValueChange={(value) => handleSelectChange("ticket_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Sin ticket</SelectItem>
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
                <Select value={selectedSection?.toString() || ""} onValueChange={(value) => setSelectedSection(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Ninguna</SelectItem>
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

              {attendeeAmenities.length > 0 &&
                attendeeAmenities.some((a) => !amenities.some((am) => am.id === a.id)) && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Otras amenidades asignadas:</h4>
                    <div className="border rounded-md p-3 space-y-2">
                      {attendeeAmenities
                        .filter((a) => !amenities.some((am) => am.id === a.id))
                        .map((amenity) => (
                          <div key={amenity.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`other-amenity-${amenity.id}`}
                              checked={selectedAmenities.some((a) => a.id === amenity.id)}
                              onCheckedChange={() => handleAmenityToggle(amenity)}
                            />
                            <Label htmlFor={`other-amenity-${amenity.id}`} className="flex-1 cursor-pointer">
                              {amenity.name}
                              {amenity.description && (
                                <span className="text-gray-500 text-sm block">{amenity.description}</span>
                              )}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default EditarAsistenteModal
