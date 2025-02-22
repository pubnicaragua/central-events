"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderForm } from "@/components/checkout/order-form"
import { AttendeeForm } from "@/components/checkout/attendee-form"
import { createOrder } from "../components/lib/actions/orders"
import { createAttendee } from "../components/lib/actions/attendees"
import { getTicket } from "../components/lib/actions/tickets"

export default function CheckoutPage() {
  const { eventId, ticketId } = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingTicket, setLoadingTicket] = useState(true)
  const [orderData, setOrderData] = useState(null)
  const [ticketData, setTicketData] = useState(null)
  const [error, setError] = useState(null)
  const [step, setStep] = useState("order") // Nuevo estado para controlar el paso actual

  useEffect(() => {
    async function fetchTicket() {
      setLoadingTicket(true)
      try {
        const ticket = await getTicket(ticketId)
        if (!ticket) {
          setError("Ticket no encontrado")
          return
        }
        setTicketData(ticket)
      } catch (error) {
        console.error("Error fetching ticket:", error)
        setError("Error al cargar el ticket")
      } finally {
        setLoadingTicket(false)
      }
    }

    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const handleOrderSubmit = async (data) => {
    if (!ticketData) return

    setLoading(true)
    try {
      const total = data.quantity * (ticketData.price || 0)

      const order = await createOrder({
        ...data,
        event_id: eventId,
        ticket_id: ticketId,
        total: total,
      })
      setOrderData(order)
      setStep("attendees") // Cambiamos al paso de asistentes después de crear la orden
    } catch (error) {
      console.error("Error creating order:", error)
      setError("Error al crear la orden")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendeeSubmit = async (attendees) => {
    setLoading(true)
    try {
      const promises = attendees.map((attendee) =>
        createAttendee({
          ...attendee,
          order_id: orderData.id,
          ticket_id: ticketId,
        }),
      )
      await Promise.all(promises)
      window.location.href = `/order-confirmation/${orderData.id}`
    } catch (error) {
      console.error("Error creating attendees:", error)
      setError("Error al crear los asistentes")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600">{error}</p>
              <Link
                to={`/event/${eventId}`}
                className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al evento
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadingTicket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Cargando información del ticket...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          to={`/event/${eventId}`}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{step === "attendees" ? "Detalles de los asistentes" : "Completar orden"}</CardTitle>
              </CardHeader>
              <CardContent>
                {step === "order" ? (
                  <OrderForm onSubmit={handleOrderSubmit} isLoading={loading} />
                ) : (
                  <AttendeeForm onSubmit={handleAttendeeSubmit} isLoading={loading} orderData={orderData} />
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent>
                {ticketData && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{ticketData.title}</p>
                        <p className="text-sm text-gray-500">
                          {orderData
                            ? `${orderData.quantity} x $${ticketData.price?.toFixed(2) || "0.00"}`
                            : `$${ticketData.price?.toFixed(2) || "0.00"}`}
                        </p>
                      </div>
                      {orderData && (
                        <p className="font-medium">${(orderData.quantity * (ticketData.price || 0) || 0).toFixed(2)}</p>
                      )}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${orderData ? orderData.total.toFixed(2) : (ticketData.price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

