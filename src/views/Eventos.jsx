"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Calendar, Loader } from "lucide-react"
import supabase from "../api/supabase"
import EventCard from "../components/events/EventCard"
import CreateEventModal from "../components/events/CreateEventModal"

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
    <div className="min-h-screen bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-emerald-900 flex items-center">
              <Calendar className="w-7 h-7 mr-3 text-emerald-700" />
              Eventos
            </h2>
            <button
              className="bg-emerald-800 text-white px-5 py-2.5 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md"
              onClick={() => setShowCreateEventModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Evento
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center shadow-sm">
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre del evento"
                  className="pl-10 px-4 py-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full md:w-64 bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-emerald-900"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="recent">Fecha de inicio más reciente</option>
                <option value="oldest">Fecha de inicio más antigua</option>
              </select>
            </div>
          </div>

          <div className="border-b border-emerald-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {["Próximo", "Terminado", "Archivado"].map((tab) => (
                <button
                  key={tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === tab
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-gray-500 hover:text-emerald-700 hover:border-emerald-300"
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
              <div className="text-center py-16">
                <Loader className="h-12 w-12 animate-spin text-emerald-700 mx-auto mb-4" />
                <p className="text-emerald-800">Cargando eventos...</p>
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
              <div className="text-center py-16 bg-emerald-50 rounded-xl border border-emerald-100">
                <Calendar className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-700 mb-4">No hay eventos para mostrar</p>
                <button
                  onClick={() => setShowCreateEventModal(true)}
                  className="text-emerald-700 hover:text-emerald-900 font-medium bg-white px-5 py-2 rounded-lg shadow-sm border border-emerald-200 hover:bg-emerald-50 transition-colors"
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

