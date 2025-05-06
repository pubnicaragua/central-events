"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import supabase from "../api/supabase"
import useAuth from "../hooks/useAuth"
import { Edit, Eye, QrCode, Search, Trash, Download, Upload, Mail } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import ConfirmDialog from "../components/confirm-dialog"
import AgregarAsistenteModal from "../components/attendants/agregar-asistente-modal"
import EditarAsistenteModal from "../components/attendants/editar-asistente-modal"
import VerAmenidadesModal from "../components/attendants/ver-amenidades-modal"
import QrCodeModal from "../components/attendants/qr-code-modal"
import ImportarAsistentesModal from "../components/attendants/importar-asistentes-modal"
import BulkEmailModal from "../components/attendants/bulk-email-modal"

const AsistentesPage = () => {
  const { eventId } = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [attendees, setAttendees] = useState([])
  const [agregarModalOpen, setAgregarModalOpen] = useState(false)
  const [editarModalOpen, setEditarModalOpen] = useState(false)
  const [amenidadesModalOpen, setAmenidadesModalOpen] = useState(false)
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false)
  const [importarModalOpen, setImportarModalOpen] = useState(false)
  const [bulkEmailModalOpen, setBulkEmailModalOpen] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [notifiedCount, setNotifiedCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalAttendees, setTotalAttendees] = useState(0)
  const [bulkAttendees, setBulkAttendees] = useState([])
  const attendeesPerPage = 20


  const { isAdmin } = useAuth()

  // Cargar asistentes
  useEffect(() => {
    if (eventId) {
      fetchAttendees(currentPage, attendeesPerPage, searchQuery)
      fetchTickets()
      fetchNotifiedCount()
    }
  }, [eventId, currentPage, searchQuery])

  const fetchAttendees = async (page = 1, limit = 20, search = "") => {
    const from = (page - 1) * limit
    const to = from + limit - 1

    try {
      setIsLoading(true)

      let query = supabase
        .from("attendants")
        .select(`*, tickets(name)`, { count: "exact" })
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .range(from, to)

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,second_name.ilike.%${search}%,code.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setAttendees(data || [])
      setTotalAttendees(count || 0)

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

  const fetchNotifiedCount = async () => {
    try {
      const { count, error } = await supabase
        .from("attendants")
        .select("id", { count: "exact", head: true }) // `head: true` optimiza la consulta
        .eq("event_id", eventId)
        .eq("notificated", true)

      if (error) throw error

      setNotifiedCount(count || 0)
    } catch (error) {
      console.error("Error al contar correos enviados:", error)
    }
  }

  // Fetch all attendees (for the bulk email modal)
  const fetchAllAttendees = async () => {
    const { data, error } = await supabase
      .from("attendants")
      .select(`*, tickets(name)`)
      .eq("event_id", eventId)

    if (error) {
      console.error("Error al obtener todos los asistentes:", error)
      return []
    }

    return data || []
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
          checked_in: attendantData.checked_in,
          ticket_id: attendantData.ticket_id,
          code,
          event_id: eventId,
          notificated: false, // Asegurarse de que el nuevo asistente tenga notificated en false
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
          checked_in: attendantData.checked_in,
          ticket_id: attendantData.ticket_id,
          notificated: attendantData.notificated, // Asegurarse de que el asistente tenga notificated en false
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
      attendee.checked_in || "",
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

  const getchecked_inBadge = (checked_in) => {
    if (checked_in) {
      return <Badge className="bg-green-500">Confirmado</Badge>
    } else {
      return <Badge variant="outline">No confirmado</Badge>
    }
  }

  const handleOpenBulkEmail = async () => {
    const allAtts = await fetchAllAttendees()
    setBulkAttendees(allAtts)
    setBulkEmailModalOpen(true)
  }


  // Manejar cuando se envían correos exitosamente
  const handleEmailSent = () => {
    fetchAttendees(currentPage, attendeesPerPage, searchQuery)
    fetchNotifiedCount() // Actualizar el conteo de correos enviados
  }

  const totalPages = Math.ceil(totalAttendees / attendeesPerPage)

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asistentes</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleOpenBulkEmail} // ✅ ahora sí se cargan todos los asistentes
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={notifiedCount >= 300}
          >
            <Mail className="w-4 h-4" />
            Enviar correos ({notifiedCount}/300)
          </Button>

          {notifiedCount >= 300 && (
            <div className="text-red-500 text-xs mt-1">Has alcanzado el límite de 300 correos diarios.</div>
          )}
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => setImportarModalOpen(true)} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar Excel
          </Button>
          <Button onClick={() => setAgregarModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
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
      ) : attendees.length === 0 ? (
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
                <th className="px-4 py-3 text-center">NOTIFICADO</th>
                <th className="px-4 py-3 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((attendee) => (
                <tr key={attendee.id} className="border-b">
                  <td className="px-4 py-4">
                    {attendee.name} {attendee.second_name}
                  </td>
                  <td className="px-4 py-4">{attendee.email || "-"}</td>
                  <td className="px-4 py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{attendee.code}</code>
                  </td>
                  <td className="px-4 py-4">{attendee.tickets?.name || "-"}</td>
                  <td className="px-4 py-4">{getchecked_inBadge(attendee.checked_in)}</td>
                  <td className="px-4 py-4 text-center">
                    {attendee.notificated ? (
                      <Badge className="bg-green-500">Sí</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </td>
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
                      {isAdmin && (
                        <>
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
                            className="text-black hover:text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setSelectedAttendee(attendee)
                              setConfirmDialogOpen(true)
                            }}
                            title="Eliminar"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center items-center gap-2 mt-6">
            <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              Anterior
            </Button>
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal para agregar asistente */}
      <AgregarAsistenteModal
        isOpen={agregarModalOpen}
        onClose={() => setAgregarModalOpen(false)}
        onSave={handleAddAttendee}
        eventId={eventId}
        tickets={tickets}
        supabase={supabase}
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
        <QrCodeModal
          isOpen={qrCodeModalOpen}
          onClose={() => setQrCodeModalOpen(false)}
          attendee={selectedAttendee}
          onEmailSent={handleEmailSent}
          emailsSentToday={notifiedCount}
        />
      )}

      {/* Modal para importar asistentes desde Excel */}
      <ImportarAsistentesModal
        isOpen={importarModalOpen}
        onClose={() => setImportarModalOpen(false)}
        onComplete={fetchAttendees}
        eventId={eventId}
        tickets={tickets}
      />

      {/* Nuevo modal para enviar correos masivos */}
      <BulkEmailModal
        isOpen={bulkEmailModalOpen}
        onClose={() => setBulkEmailModalOpen(false)}
        attendees={bulkAttendees} // ✅ Esto son todos
        eventId={eventId}
        onEmailSent={handleEmailSent}
        emailsSentToday={notifiedCount}
      />

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
