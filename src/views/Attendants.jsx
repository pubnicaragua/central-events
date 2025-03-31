/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import supabase from "../api/supabase"
import { toast } from "react-hot-toast"
import { Search, Plus, Edit, Trash2, Eye, Download, ChevronDown, ChevronUp } from "lucide-react"
import AddAttendeeModal from "../components/AddAttendeeModal"
import EditAttendeeModal from "../components/EditAttendeeModal"
import ConfirmDialog from "../components/ConfirmDialog"

function AttendeesPage() {
  const { eventId } = useParams()
  const [attendees, setAttendees] = useState([])
  const [filteredAttendees, setFilteredAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [tickets, setTickets] = useState([])
  const [ticketFilter, setTicketFilter] = useState("all")

  useEffect(() => {
    fetchAttendees()
    fetchTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, supabase])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase.from("tickets").select("id, name").eq("event_id", eventId)

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
    }
  }

  const fetchAttendees = async () => {
    try {
      setLoading(true)

      // Primero obtenemos todas las órdenes para este evento
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, ticket_id")
        .eq("event_id", eventId)

      if (ordersError) throw ordersError

      if (!ordersData || ordersData.length === 0) {
        setAttendees([])
        setFilteredAttendees([])
        setLoading(false)
        return
      }

      const orderIds = ordersData.map((order) => order.id)

      // Luego obtenemos todos los asistentes relacionados con esas órdenes
      const { data: attendeesData, error: attendeesError } = await supabase
        .from("attendants")
        .select(`
          *,
          order:order_id(
            id,
            name,
            email,
            ticket:ticket_id(
              id,
              name
            )
          )
        `)
        .in("order_id", orderIds)

      if (attendeesError) throw attendeesError

      setAttendees(attendeesData || [])
      setFilteredAttendees(attendeesData || [])
    } catch (err) {
      console.error("Error fetching attendees:", err)
      setError("Error al cargar los datos de los asistentes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Aplicar filtros y búsqueda
    let result = [...attendees]

    // Filtrar por estado
    if (statusFilter !== "all") {
      result = result.filter((attendee) => attendee.status === statusFilter)
    }

    // Filtrar por ticket
    if (ticketFilter !== "all") {
      result = result.filter((attendee) => attendee.order?.ticket?.id === ticketFilter)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (attendee) =>
          attendee.name?.toLowerCase().includes(query) ||
          attendee.second_name?.toLowerCase().includes(query) ||
          attendee.email?.toLowerCase().includes(query) ||
          attendee.code?.toLowerCase().includes(query),
      )
    }

    // Ordenar resultados
    result.sort((a, b) => {
      let fieldA, fieldB

      // Determinar los campos a comparar según el campo de ordenamiento
      switch (sortField) {
        case "name":
          fieldA = `${a.name || ""} ${a.second_name || ""}`.toLowerCase()
          fieldB = `${b.name || ""} ${b.second_name || ""}`.toLowerCase()
          break
        case "email":
          fieldA = (a.email || "").toLowerCase()
          fieldB = (b.email || "").toLowerCase()
          break
        case "order":
          fieldA = a.order_id || 0
          fieldB = b.order_id || 0
          break
        case "status":
          fieldA = (a.status || "").toLowerCase()
          fieldB = (b.status || "").toLowerCase()
          break
        default:
          fieldA = a[sortField] || ""
          fieldB = b[sortField] || ""
      }

      // Ordenar ascendente o descendente
      if (sortDirection === "asc") {
        return fieldA > fieldB ? 1 : -1
      } else {
        return fieldA < fieldB ? 1 : -1
      }
    })

    setFilteredAttendees(result)
  }, [attendees, searchQuery, sortField, sortDirection, statusFilter, ticketFilter])

  const handleSort = (field) => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiamos la dirección
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Si es un nuevo campo, ordenamos ascendente por defecto
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleAddAttendee = async (attendeeData) => {
    try {
      // Primero creamos o buscamos una orden
      let orderId = attendeeData.order_id

      if (!orderId) {
        // Si no se proporcionó un ID de orden, creamos una nueva
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            name: `${attendeeData.name} ${attendeeData.second_name || ""}`,
            email: attendeeData.email,
            event_id: eventId,
            ticket_id: attendeeData.ticket_id || null,
            status: "COMPLETED",
            quantity: 1,
          })
          .select()
          .single()

        if (orderError) throw orderError
        orderId = orderData.id
      }

      // Luego creamos el asistente
      const { data, error } = await supabase
        .from("attendants")
        .insert({
          name: attendeeData.name,
          second_name: attendeeData.second_name || "",
          email: attendeeData.email,
          code: attendeeData.code || null,
          status: attendeeData.status || "ACTIVE",
          order_id: orderId,
        })
        .select()

      if (error) throw error

      toast.success("Asistente agregado correctamente")
      fetchAttendees() // Actualizamos la lista
      return { success: true, data }
    } catch (error) {
      console.error("Error adding attendee:", error)
      toast.error("Error al agregar el asistente")
      return { success: false, error }
    }
  }

  const handleEditAttendee = async (attendeeData) => {
    try {
      const { data, error } = await supabase
        .from("attendants")
        .update({
          name: attendeeData.name,
          second_name: attendeeData.second_name || "",
          email: attendeeData.email,
          code: attendeeData.code || null,
          status: attendeeData.status || "ACTIVE",
        })
        .eq("id", attendeeData.id)
        .select()

      if (error) throw error

      toast.success("Asistente actualizado correctamente")
      fetchAttendees() // Actualizamos la lista
      return { success: true, data }
    } catch (error) {
      console.error("Error updating attendee:", error)
      toast.error("Error al actualizar el asistente")
      return { success: false, error }
    }
  }

  const handleDeleteAttendee = async () => {
    if (!selectedAttendee) return

    try {
      const { error } = await supabase.from("attendants").delete().eq("id", selectedAttendee.id)

      if (error) throw error

      toast.success("Asistente eliminado correctamente")
      fetchAttendees() // Actualizamos la lista
      setIsDeleteDialogOpen(false)
      setSelectedAttendee(null)
    } catch (error) {
      console.error("Error deleting attendee:", error)
      toast.error("Error al eliminar el asistente")
    }
  }

  const handleExportCSV = () => {
    // Preparar los datos para exportar
    const csvData = filteredAttendees.map((attendee) => ({
      ID: attendee.id,
      Nombre: attendee.name,
      Apellido: attendee.second_name || "",
      Email: attendee.email,
      Código: attendee.code || "",
      Estado: attendee.status,
      "ID Orden": attendee.order_id,
      Ticket: attendee.order?.ticket?.name || "",
    }))

    // Convertir a CSV
    const headers = Object.keys(csvData[0] || {}).join(",")
    const rows = csvData.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `asistentes-evento-${eventId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openEditModal = (attendee) => {
    setSelectedAttendee(attendee)
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (attendee) => {
    setSelectedAttendee(attendee)
    setIsDeleteDialogOpen(true)
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asistentes</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExportCSV()}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar por nombre, email o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-md"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border rounded-md px-4 py-2 pr-8"
              >
                <option value="all">Todos los estados</option>
                <option value="ACTIVE">No confirmados</option>
                <option value="CONFIRMED">Confirmados</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            <div className="relative">
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="appearance-none bg-white border rounded-md px-4 py-2 pr-8"
              >
                <option value="all">Todos los tickets</option>
                {tickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de asistentes */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">Nombre {renderSortIcon("name")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">Email {renderSortIcon("email")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("order")}
                >
                  <div className="flex items-center">Orden {renderSortIcon("order")}</div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">Estado {renderSortIcon("status")}</div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attendee.name} {attendee.second_name}
                      </div>
                      {attendee.code && <div className="text-xs text-gray-500">Código: {attendee.code}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{attendee.order_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendee.order?.ticket?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attendee.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {attendee.status === "CONFIRMED" ? "Confirmado" : "No confirmado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(attendee)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(attendee)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <Link
                          to={`/order/${attendee.order_id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver orden"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No hay asistentes registrados para este evento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar asistente */}
      {isAddModalOpen && (
        <AddAttendeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAttendee}
          eventId={eventId}
          tickets={tickets}
        />
      )}

      {/* Modal para editar asistente */}
      {isEditModalOpen && selectedAttendee && (
        <EditAttendeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedAttendee(null)
          }}
          onSubmit={handleEditAttendee}
          attendee={selectedAttendee}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAttendee}
        title="Eliminar asistente"
        message={`¿Estás seguro de que deseas eliminar a ${selectedAttendee?.name} ${selectedAttendee?.second_name || ""}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default AttendeesPage

