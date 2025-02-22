"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { Search, Eye, Mail, Edit, Send, Ban, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AddAttendeeDialog } from "../components/attendees/add-attendee-dialog"
import { EditAttendeeDialog } from "../components/attendees/edit-attendee-dialog"
import supabase from "../api/supabase"

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState(null)
  const { eventId } = useParams()

  const fetchAttendees = useCallback(async () => {
    setIsLoading(true)
    try {
      // Primero obtenemos las órdenes del evento
      const { data: orders, error: ordersError } = await supabase.from("orders").select("id").eq("event_id", eventId)

      if (ordersError) throw ordersError

      if (orders && orders.length > 0) {
        // Luego obtenemos los asistentes que corresponden a esas órdenes
        const { data: attendeesData, error: attendeesError } = await supabase
          .from("attendants")
          .select(`
            *,
            tickets:ticket_id (
              title
            )
          `)
          .in(
            "order_id",
            orders.map((order) => order.id),
          )

        if (attendeesError) throw attendeesError

        const formattedAttendees =
          attendeesData?.map((attendee) => ({
            ...attendee,
            ticket_name: attendee.tickets?.title,
          })) || []

        setAttendees(formattedAttendees)
      } else {
        setAttendees([])
      }
    } catch (error) {
      console.error("Error fetching attendees:", error)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      fetchAttendees()
    }
  }, [eventId, fetchAttendees])

  const handleViewAttendee = (attendee) => {
    console.log("Ver asistente:", attendee)
  }

  const handleMessageAttendee = (attendee) => {
    console.log("Enviar mensaje a:", attendee)
  }

  const handleEditAttendee = (attendee) => {
    setSelectedAttendee(attendee)
    setEditDialogOpen(true)
  }

  const handleResendEmail = (attendee) => {
    console.log("Reenviar correo a:", attendee)
  }

  const handleCancelTicket = (attendee) => {
    console.log("Cancelar boleto de:", attendee)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Asistentes</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Busque por nombre del asistente, correo electrónico..." className="pl-8" />
        </div>
        <Select defaultValue="recent">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Más reciente Prim" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más reciente Prim</SelectItem>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
        <Button variant="outline">Exportar</Button>
      </div>

      {isLoading ? (
        <div>Cargando asistentes...</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Nombre</div>
            <div className="col-span-3">Correo electrónico</div>
            <div className="col-span-2">Orden</div>
            <div className="col-span-2">Boleto</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-1"></div>
          </div>
          {attendees.length > 0 ? (
            attendees.map((attendee) => (
              <div key={attendee.id} className="grid grid-cols-12 gap-4 border-t p-4 items-center">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-800">
                    {attendee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{attendee.name}</div>
                    <div className="text-sm text-muted-foreground">{attendee.order_id}</div>
                  </div>
                </div>
                <div className="col-span-3">{attendee.email}</div>
                <div className="col-span-2">{attendee.order_id}</div>
                <div className="col-span-2">{attendee.ticket_name || "Entrada VIP"}</div>
                <div className="col-span-1">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {attendee.status.toUpperCase()}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleViewAttendee(attendee)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver asistente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMessageAttendee(attendee)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Asistente del mensaje
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditAttendee(attendee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar asistente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResendEmail(attendee)}>
                        <Send className="mr-2 h-4 w-4" />
                        Reenviar correo electrónico del ticket
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCancelTicket(attendee)} className="text-red-600">
                        <Ban className="mr-2 h-4 w-4" />
                        Cancelar boleto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No hay asistentes registrados para este evento</div>
          )}
        </div>
      )}

      <AddAttendeeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        eventId={eventId}
        onAttendeeCreated={() => {
          fetchAttendees()
        }}
      />

      <EditAttendeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        attendee={selectedAttendee}
        onAttendeeUpdated={() => {
          fetchAttendees()
          setSelectedAttendee(null)
        }}
      />
    </div>
  )
}

