"use client"

import PropTypes from "prop-types"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Calendar, MoreVertical, Eye, Settings, Copy, Archive, Plus, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getEvents } from "../utils/eventsActions"
import { OrganizerForm } from "../components/organizer-form"
import { CreateEventModal } from "../components/create-event-modal"
import { EventFilters } from "../components/manage/event-filters"
import supabase from "../api/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState("Próximo")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("start_date_desc")
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [openEventModal, setOpenEventModal] = useState(false)
  const [organizers, setOrganizers] = useState([])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const eventsData = await getEvents(status, searchTerm, sortBy)
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }, [status, searchTerm, sortBy])

  useEffect(() => {
    const fetchOrganizers = async () => {
      const { data } = await supabase.from("organizers").select("*")
      if (data) setOrganizers(data)
    }
    fetchOrganizers()
    fetchEvents()
  }, [fetchEvents])

  const handleCreateOrganizer = () => {
    setOpenModal(true)
  }

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

        <div className="mb-6 flex items-center justify-between">
          <EventFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            status={status}
            setStatus={setStatus}
            onFilterChange={fetchEvents}
          />

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
                    <h3 className="text-lg font-semibold text-gray-800">
                      <Link to={`/manage/event/${event.id}/getting-started`} className="text-blue-600 hover:underline">
                        {event.name}
                      </Link>
                    </h3>
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

EventsPage.propTypes = {
  // Add any props if needed for EventsPage
}

// Add PropTypes for other components used in this file
CreateEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  organizers: PropTypes.array.isRequired,
  onEventCreated: PropTypes.func.isRequired,
}

OrganizerForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

