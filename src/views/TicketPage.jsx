"use client"

import { useParams } from "react-router-dom"
import * as React from "react"
import { Search, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateTicketDialog } from "../components/tickets/create-ticket-dialog"
import { TicketActions } from "../components/tickets/ticket-actions"
import { getTickets, getEscaledTickets } from "../utils/ticketActions"

export default function TicketsPage() {
  const [open, setOpen] = React.useState(false)
  const [tickets, setTickets] = React.useState([])
  const [escaledTickets, setEscaledTickets] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { eventId } = useParams()

  const fetchTickets = React.useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      const [ticketsData, escaledTicketsData] = await Promise.all([getTickets(eventId), getEscaledTickets()])
      setTickets(ticketsData)
      setEscaledTickets(escaledTicketsData)
    } catch (error) {
      console.error("Error al obtener los tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  React.useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleTicketCreated = () => {
    fetchTickets()
  }

  const handleEdit = (ticket) => {
    // TODO: Implementar edición
    console.log("Editar ticket:", ticket)
  }

  const handleDelete = () => {
    fetchTickets()
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Entradas</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre del billete..." className="pl-8" />
        </div>
        <Select defaultValue="default">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Orden de la página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Por defecto</SelectItem>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
            <SelectItem value="price-asc">Precio (Menor-Mayor)</SelectItem>
            <SelectItem value="price-desc">Precio (Mayor-Menor)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Ticket
        </Button>
      </div>

      {isLoading ? (
        <div>Cargando tickets...</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-4">TÍTULO</div>
            <div className="col-span-2">ESTADO</div>
            <div className="col-span-2">PRECIO</div>
            <div className="col-span-2">CANTIDAD</div>
            <div className="col-span-2"></div>
          </div>
          {Array.isArray(tickets) && tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div key={ticket.id} className="grid grid-cols-12 gap-4 border-t p-4">
                <div className="col-span-4">{ticket.title}</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {ticket.status ? ticket.status.toUpperCase() : "SIN ESTADO"}
                  </span>
                </div>
                <div className="col-span-2 font-medium text-emerald-600">
                  {ticket.price ? `$${ticket.price.toFixed(2)}` : "Gratis"}
                </div>
                <div className="col-span-2">{ticket.quantity || "Ilimitado"}</div>
                <div className="col-span-2 flex justify-end">
                  <TicketActions ticket={ticket} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              </div>
            ))
          ) : (
            <p>No hay tickets disponibles</p>
          )}

          {Array.isArray(escaledTickets) && escaledTickets.length > 0 ? (
            escaledTickets.map((ticket) => (
              <div key={ticket.id} className="grid grid-cols-12 gap-4 border-t p-4">
                <div className="col-span-4">{ticket.level_name} (Escalonado)</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    ESCALONADO
                  </span>
                </div>
                <div className="col-span-2 font-medium text-blue-600">
                  {ticket.price ? `$${ticket.price.toFixed(2)}` : "Gratis"}
                </div>
                <div className="col-span-2">{ticket.quantity || "Ilimitado"}</div>
                <div className="col-span-2 flex justify-end">
                  <TicketActions ticket={ticket} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              </div>
            ))
          ) : (
            <p>No hay tickets escalonados disponibles</p>
          )}
        </div>
      )}

      <CreateTicketDialog open={open} onOpenChange={setOpen} onTicketCreated={handleTicketCreated} eventId={eventId} />
    </div>
  )
}

