"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEvent, getEventTickets } from "../components/lib/actions/events"

export default function EventDetailPage() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEventData() {
      try {
        const [eventData, ticketsData] = await Promise.all([getEvent(eventId), getEventTickets(eventId)])
        setEvent(eventData)
        setTickets(ticketsData)
      } catch (error) {
        console.error("Error fetching event data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!event) {
    return <div>Evento no encontrado</div>
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link to="/events" className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la página del evento
        </Link>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h2>Sobre el evento</h2>
                  <p>{event.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Entradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h3 className="font-medium">{ticket.title}</h3>
                        <p className="text-sm text-gray-600">
                          {ticket.price ? `$${ticket.price.toFixed(2)}` : "Gratis"}
                        </p>
                        {ticket.quantity && <p className="text-xs text-gray-500">{ticket.quantity} disponibles</p>}
                      </div>
                      <Button
                        onClick={() => {
                          window.location.href = `/checkout/${event.id}/${ticket.id}`
                        }}
                      >
                        Seleccionar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

