"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import supabase from "../api/supabase"

interface VerAmenidadesModalProps {
  isOpen: boolean
  onClose: () => void
  attendee: any
}

const VerAmenidadesModal: React.FC<VerAmenidadesModalProps> = ({ isOpen, onClose, attendee }) => {
  const [amenitiesBySection, setAmenitiesBySection] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && attendee) {
      fetchAttendeeAmenities()
    }
  }, [isOpen, attendee])

  const fetchAttendeeAmenities = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("amenities_attendees")
        .select(`
          amenitie_id,
          quantity,
          total,
          is_active,
          amenities (
            id,
            name,
            description,
            price,
            section_id,
            amenities_sections (
              id,
              name,
              is_default
            )
          )
        `)
        .eq("attendee_id", attendee.id)

      if (error) throw error

      // Agrupar por sección
      const grouped = {}
      data.forEach((item) => {
        const section = item.amenities.amenities_sections
        if (!section) return

        if (!grouped[section.id]) {
          grouped[section.id] = {
            section: section,
            amenities: [],
          }
        }

        grouped[section.id].amenities.push({
          ...item.amenities,
          quantity: item.quantity,
          total: item.total,
          is_active: item.is_active,
        })
      })

      setAmenitiesBySection(grouped)
    } catch (error) {
      console.error("Error al cargar las amenidades del asistente:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Amenidades de {attendee?.name} {attendee?.second_name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : Object.keys(amenitiesBySection).length === 0 ? (
          <div className="text-center py-8 text-gray-500">Este asistente no tiene amenidades asignadas</div>
        ) : (
          <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2">
            {Object.values(amenitiesBySection).map((group: any) => (
              <div key={group.section.id} className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{group.section.name}</h3>
                    {group.section.is_default && (
                      <Badge variant="outline" className="mt-1">
                        Sección predeterminada
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="divide-y">
                  {group.amenities.map((amenity) => (
                    <div key={amenity.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{amenity.name}</div>
                        {amenity.description && <div className="text-sm text-gray-500">{amenity.description}</div>}
                      </div>
                      <div className="text-right">
                        {amenity.price > 0 && <div className="font-medium">${amenity.price.toFixed(2)}</div>}
                        {amenity.quantity > 1 && (
                          <div className="text-sm text-gray-500">Cantidad: {amenity.quantity}</div>
                        )}
                        {!amenity.is_active && (
                          <Badge variant="outline" className="bg-gray-100">
                            Inactiva
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default VerAmenidadesModal

