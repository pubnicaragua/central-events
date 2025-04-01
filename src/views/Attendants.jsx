"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import supabase from "../api/supabase"
import { Edit, Eye, QrCode, Search, Trash, Download } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import ConfirmDialog from "../components/confirm-dialog"
import AgregarAsistenteModal from "../components/agregar-asistente-modal"
import EditarAsistenteModal from "../components/editar-asistente-modal"
import VerAmenidadesModal from "../components/ver-amenidades-modal"
import QrCodeModal from "../components/qr-code-modal"

const AsistentesPage = () => {
  const { eventId } = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [attendees, setAttendees] = useState([])
  const [agregarModalOpen, setAgregarModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [amenidadesModalOpen, setAmenidadesModalOpen] = useState(false)
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  // Cargar asistentes
  useEffect(() => {
    fetchAttendees()
    fetchTickets()
  }, [eventId])

  const fetchAttendees = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("attendants")
        .select(`
          *,
          tickets(name)
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setAttendees(data || [])
    } catch (error) {
      console.error("Error al cargar los asistentes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase.from("tickets").select("*").eq("event_id", eventId)

      if (error) throw error

      setTickets(data || [])
    } catch (error) {
      console.error("Error al cargar los tickets:", error)
    }
  }

  // Agregar asistente
  const handleAddAttendee = async (attendeeData) => {
    try {
      // Extraer selectedAmenities del objeto attendeeData
      const { selectedAmenities, ...attendantData } = attendeeData

      // Generar código alfanumérico de 6 dígitos
      const code = generateRandomCode()

      // Crear asistente sin incluir selectedAmenities y sin order_id
      const { data: newAttendee, error } = await supabase
        .from("attendants")
        .insert({
          name: attendantData.name,
          second_name: attendantData.second_name,
          email: attendantData.email,
          status: attendantData.status,
          ticket_id: attendantData.ticket_id,
          code,
          event_id: eventId,
        })
        .select()

      if (error) throw error

      // Si se seleccionaron amenidades, asignarlas al asistente
      if (selectedAmenities && selectedAmenities.length > 0) {
        const amenityAssignments = selectedAmenities.map((amenity) => ({
          amenitie_id: amenity.id,
          attendee_id: newAttendee[0].id,
          quantity: 1,
          is_active: true,
        }))

        const { error: assignError } = await supabase.from("amenities_attendees").insert(amenityAssignments)

        if (assignError) throw assignError
      }

      setAgregarModalOpen(false)
      await fetchAttendees()
    } catch (error) {
      console.error("Error al agregar el asistente:", error)
    }
  }

  // Editar asistente
  const handleEditAttendee = async (attendeeData) => {
    try {
      // Extraer selectedAmenities del objeto attendeeData
      const { selectedAmenities, ...attendantData } = attendeeData

      // Actualizar datos del asistente sin incluir selectedAmenities y sin order_id
      const { error } = await supabase
        .from("attendants")
        .update({
          name: attendantData.name,
          second_name: attendantData.second_name,
          email: attendantData.email,
          status: attendantData.status,
          ticket_id: attendantData.ticket_id,
        })
        .eq("id", selectedAttendee.id)

      if (error) throw error

      // Gestionar amenidades
      if (selectedAmenities) {
        // Primero, obtener las amenidades actuales del asistente
        const { data: currentAmenities, error: fetchError } = await supabase
          .from("amenities_attendees")
          .select("amenitie_id")
          .eq("attendee_id", selectedAttendee.id)

        if (fetchError) throw fetchError

        const currentIds = currentAmenities.map((item) => item.amenitie_id)
        const newIds = selectedAmenities.map((item) => item.id)

        // Amenidades a eliminar (están en current pero no en new)
        const toRemove = currentIds.filter((id) => !newIds.includes(id))

        // Amenidades a agregar (están en new pero no en current)
        const toAdd = selectedAmenities
          .filter((item) => !currentIds.includes(item.id))
          .map((amenity) => ({
            amenitie_id: amenity.id,
            attendee_id: selectedAttendee.id,
            quantity: 1,
            is_active: true,
          }))

        // Eliminar amenidades que ya no están seleccionadas
        if (toRemove.length > 0) {
          const { error: removeError } = await supabase
            .from("amenities_attendees")
            .delete()
            .eq("attendee_id", selectedAttendee.id)
            .in("amenitie_id", toRemove)

          if (removeError) throw removeError
        }

        // Agregar nuevas amenidades
        if (toAdd.length > 0) {
          const { error: addError } = await supabase.from("amenities_attendees").insert(toAdd)

          if (addError) throw addError
        }
      }

      setEditarModalOpen(false)
      await fetchAttendees()
    } catch (error) {
      console.error("Error al editar el asistente:", error)
    }
  }

  // Eliminar asistente
  const handleDeleteAttendee = async (attendeeId) => {
    try {
      // Primero eliminar las relaciones en amenities_attendees
      const { error: relError } = await supabase.from("amenities_attendees").delete().eq("attendee_id", attendeeId)

      if (relError) throw relError

      // Luego eliminar el asistente
      const { error } = await supabase.from("attendants").delete().eq("id", attendeeId)

      if (error) throw error

      await fetchAttendees()
    } catch (error) {
      console.error("Error al eliminar el asistente:", error)
    }
  }

  // Generar código aleatorio alfanumérico de 6 caracteres
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Exportar asistentes a CSV
  const handleExport = () => {
    const headers = ["Nombre", "Apellido", "Email", "Código", "Estado", "Ticket"]

    const csvData = attendees.map((attendee) => [
      attendee.name || "",
      attendee.second_name || "",
      attendee.email || "",
      attendee.code || "",
      attendee.status || "",
      attendee.tickets?.name || "",
    ])

    // Crear contenido CSV
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `asistentes-evento-${eventId}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredAttendees = attendees.filter((attendee) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (attendee.name && attendee.name.toLowerCase().includes(searchLower)) ||
      (attendee.second_name && attendee.second_name.toLowerCase().includes(searchLower)) ||
      (attendee.code && attendee.code.toLowerCase().includes(searchLower))
    )
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-500">Confirmado</Badge>
      case "no confirmado":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            No confirmado
          </Badge>
        )
      case "cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>
      default:
        return <Badge variant="outline">No confirmado</Badge>
    }
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asistentes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={() => setAgregarModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            Agregar
          </Button>
        </div>
      </div>

      <div className="flex items-center mb-6 relative">
        <Search className="w-4 h-4 absolute left-3 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-lg"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : filteredAttendees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay asistentes registrados</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">NOMBRE</th>
                <th className="px-4 py-3 text-left">EMAIL</th>
                <th className="px-4 py-3 text-left">CÓDIGO</th>
                <th className="px-4 py-3 text-left">TICKET</th>
                <th className="px-4 py-3 text-left">ESTADO</th>
                <th className="px-4 py-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="border-b">
                  <td className="px-4 py-4">
                    {attendee.name} {attendee.second_name}
                  </td>
                  <td className="px-4 py-4">{attendee.email || "-"}</td>
                  <td className="px-4 py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{attendee.code}</code>
                  </td>
                  <td className="px-4 py-4">{attendee.tickets?.name || "-"}</td>
                  <td className="px-4 py-4">{getStatusBadge(attendee.status)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAttendee(attendee)
                          setAmenidadesModalOpen(true)
                        }}
                        title="Ver amenidades"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAttendee(attendee)
                          setQrCodeModalOpen(true)
                        }}
                        title="Generar QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAttendee(attendee)
                          setEditarModalOpen(true)
                        }}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedAttendee(attendee)
                          setConfirmDialogOpen(true)
                        }}
                        title="Eliminar"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para agregar asistente */}
      <AgregarAsistenteModal
        isOpen={agregarModalOpen}
        onClose={() => setAgregarModalOpen(false)}
        onSave={handleAddAttendee}
        eventId={eventId}
        tickets={tickets}
      />

      {/* Modal para editar asistente */}
      {selectedAttendee && (
        <EditarAsistenteModal
          isOpen={editarModalOpen}
          onClose={() => setEditarModalOpen(false)}
          onSave={handleEditAttendee}
          attendee={selectedAttendee}
          eventId={eventId}
          tickets={tickets}
        />
      )}

      {/* Modal para ver amenidades */}
      {selectedAttendee && (
        <VerAmenidadesModal
          isOpen={amenidadesModalOpen}
          onClose={() => setAmenidadesModalOpen(false)}
          attendee={selectedAttendee}
        />
      )}

      {/* Modal para generar QR */}
      {selectedAttendee && (
        <QrCodeModal isOpen={qrCodeModalOpen} onClose={() => setQrCodeModalOpen(false)} attendee={selectedAttendee} />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => {
          handleDeleteAttendee(selectedAttendee?.id)
          setConfirmDialogOpen(false)
        }}
        title="Eliminar asistente"
        description="¿Estás seguro de que deseas eliminar este asistente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default AsistentesPage

