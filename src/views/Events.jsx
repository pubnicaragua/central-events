"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, MoreVertical, Eye, Settings, Copy, Archive, Plus, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getEvents } from "../utils/eventsActions"
import { OrganizerForm } from "../components/organizer-form"
import { CreateEventModal } from "../components/create-event-modal"
import supabase from "../api/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("start_date_desc")
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [openEventModal, setOpenEventModal] = useState(false)
  // Añadir el estado para los organizadores
  const [organizers, setOrganizers] = useState([])

  useEffect(() => {
    const fetchOrganizers = async () => {
      const { data, } = await supabase.from("organizers").select("*")
      if (data) setOrganizers(data)
    }
    fetchOrganizers()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, []) // Only refetch when the component mounts

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const eventsData = await getEvents(status, searchTerm, sortBy)
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganizer = () => {
    setOpenModal(true) // Abre el modal cuando se haga clic en "Crear Organizador"
  }

  // Reemplazar la función handleCreateEvent con esta versión:
  const handleCreateEvent = () => {
    setOpenEventModal(true)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return {
      day: d.getDate(),
      month: new Intl.DateTimeFormat("es", { month: "short" }).format(d).toUpperCase(),
      time: d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-purple-800">Próximos eventos</h2>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Buscar por nombre del evento..."
              className="max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start_date_desc">Fecha de inicio más reciente</SelectItem>
              <SelectItem value="start_date_asc">Fecha de inicio más antigua</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Crear nuevo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateEvent}>
                <Calendar className="mr-2 h-4 w-4" />
                Evento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateOrganizer}>
                <User className="mr-2 h-4 w-4" />
                Organizador
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Modificar el renderizado del CreateEventModal */}
        <CreateEventModal
          open={openEventModal}
          setOpen={setOpenEventModal}
          organizers={organizers}
          onEventCreated={fetchEvents}
        />
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear organizador</DialogTitle>
            </DialogHeader>
            <OrganizerForm onSubmit={() => setOpenModal(false)} />
          </DialogContent>
        </Dialog>

        <div className="mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => setStatus("Próximo")}
              className={`px-4 py-2 ${status === "Próximo" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-800"}`}
            >
              Próximo
            </button>
            <button
              onClick={() => setStatus("Terminado")}
              className={`px-4 py-2 ${status === "Terminado" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-800"}`}
            >
              Terminado
            </button>
            <button
              onClick={() => setStatus("Archivado")}
              className={`px-4 py-2 ${status === "Archivado" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-800"}`}
            >
              Archivado
            </button>
          </nav>
        </div>

        {loading ? (
          <div>Cargando eventos...</div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => {
              const startDate = formatDate(event.start_date)
              return (
                <div key={event.id} className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-lg bg-purple-100 text-center">
                    <span className="text-2xl font-bold text-purple-800">{startDate.day}</span>
                    <span className="text-sm font-medium text-purple-800">{startDate.month}</span>
                    <span className="text-xs text-purple-600">{startDate.time}</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {event.status === "draft" ? "DRAFT - EN CURSO" : event.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{event.name}</h3>
                    <p className="text-sm text-gray-600">Master Producciones</p>
                    <div className="mt-2 flex gap-4 text-sm text-gray-500">
                      <span>0 entradas vendidas</span>
                      <span>$0.00 ventas brutas</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver página del evento
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Administrar evento
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar evento
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" />
                        Archivar evento
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
            <div className="mb-4">
              <Calendar className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">No hay eventos para mostrar</h3>
            <p className="mb-6 text-gray-600">Una vez que crees un evento, lo verás aquí.</p>
            <Button className="bg-green-500 hover:bg-green-600" onClick={handleCreateEvent}>
              + Crear evento
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

