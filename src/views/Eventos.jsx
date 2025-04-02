"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../api/supabase"
import EventCard from "../components/events/EventCard"
import CreateEventModal from "../components/events/CreateEventModal"
import { PlusIcon } from "../components/Icons"

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("recent")
  const [activeTab, setActiveTab] = useState("Próximo")
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function printError(tablename, action, error) {
    console.error(`Error ${action} ${tablename}: `, error)
    return `Error al ${action} ${tablename}: ${error.message || "Ocurrió un problema"}`
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error("No se encontró usuario autenticado")

        setUserId(user.id)
      } catch (err) {
        console.error("Error de autenticación:", err)
        setError("No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.")
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sortOrder])

  async function fetchEvents() {
    setLoading(true)
    setError(null)
    try {
      const status = activeTab

      // Definir el orden dinámicamente
      const isRecent = sortOrder === "recent"

      // Consulta sin filtro de usuario
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", status)
        .order("start_date", { ascending: !isRecent })

      if (error) throw error

      setEvents(data || [])
    } catch (err) {
      console.error("Error al obtener eventos:", err)
      setError("No se pudieron cargar los eventos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((event) => event.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCreateEvent = async (eventData) => {
    try {
      const { data, error } = await supabase.from("events").insert([eventData]).select()

      if (error) {
        const errorMsg = printError("events", "crear", error)
        throw new Error(errorMsg)
      }

      if (data && data[0]) {
        // Redirigir a getting-started en lugar de settings
        navigate(`/manage/event/${data.id}/getting-started`)
      } else {
        throw new Error("No se recibió confirmación del servidor")
      }
    } catch (error) {
      console.error("Error al crear evento:", error)
      throw error // Propagar el error para que el modal pueda manejarlo
    }
  }

  const handleDuplicateEvent = async (event) => {
    try {
      const duplicatedEvent = {
        organizer_id: event.organizer_id,
        name: event.name + " (Copia)",
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        status: event.status,
        user_id: userId,
      }

      const { error } = await supabase.from("events").insert([duplicatedEvent]).select()

      if (error) {
        const errorMsg = printError("event", "duplicar", error)
        setError(errorMsg)
        return
      }

      fetchEvents()
    } catch (err) {
      console.error("Error al duplicar evento:", err)
      setError("No se pudo duplicar el evento. Por favor, intenta de nuevo.")
    }
  }

  const handleArchiveEvent = async (id) => {
    try {
      const { error } = await supabase.from("events").update({ status: "Archivado" }).eq("id", id)

      if (error) {
        const errorMsg = printError("events", "archivar", error)
        setError(errorMsg)
        return
      }

      fetchEvents()
    } catch (err) {
      console.error("Error al archivar evento:", err)
      setError("No se pudo archivar el evento. Por favor, intenta de nuevo.")
    }
  }

  const handleRetry = () => {
    fetchEvents()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Eventos</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
              <p>{error}</p>
              <button
                onClick={handleRetry}
                className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar por nombre del evento"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="recent">Fecha de inicio más reciente</option>
                <option value="oldest">Fecha de inicio más antigua</option>
              </select>
            </div>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              onClick={() => setShowCreateEventModal(true)}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Crear Evento
            </button>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {["Próximo", "Terminado", "Archivado"].map((tab) => (
                <button
                  key={tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando eventos...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDuplicate={() => handleDuplicateEvent(event)}
                  onArchive={() => handleArchiveEvent(event.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No hay eventos para mostrar</p>
                <button
                  onClick={() => setShowCreateEventModal(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Crear tu primer evento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateEventModal && (
        <CreateEventModal onClose={() => setShowCreateEventModal(false)} userId={userId} onSubmit={handleCreateEvent} />
      )}
    </div>
  )
}

export default Events

