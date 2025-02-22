"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getOrder } from "../components/lib/actions/orders"
import { getTicket } from "../components/lib/actions/tickets"
import { getEvent } from "../components/lib/actions/events"
import { QRCodeCanvas } from "qrcode.react";

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [ticketData, setTicketData] = useState(null)
  const [eventData, setEventData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const order = await getOrder(orderId)
        const [ticket, event] = await Promise.all([getTicket(order.ticket_id), getEvent(order.event_id)])
        setOrderData(order)
        setTicketData(ticket)
        setEventData(event)
      } catch (error) {
        console.error("Error fetching order data:", error)
        setError("Error al cargar los detalles del pedido")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchData()
    }
  }, [orderId])

  const formatDate = (date) => {
    return new Date(date).toLocaleString("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })
  }

  const handlePrintTickets = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Cargando detalles del pedido...</p>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600">{error || "Pedido no encontrado"}</p>
              <Link to="/" className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{eventData?.name}</h1>
          <p className="text-green-600 font-medium">Pedido completado</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalles del pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">
                  {orderData.name} {orderData.second_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pedir Referencia</p>
                <p className="font-medium">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="font-medium">{orderData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de orden</p>
                <p className="font-medium">{formatDate(orderData.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Huéspedes</CardTitle>
            <Button variant="outline" size="sm" onClick={handlePrintTickets}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir todas las entradas
            </Button>
          </CardHeader>
          <CardContent>
            {Array.from({ length: orderData.quantity }).map((_, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">
                      {orderData.name} {index + 1}
                    </h3>
                    <p className="text-sm text-gray-500">{ticketData?.title || "Entrada General"}</p>
                    <p className="text-sm text-gray-500">{orderData.email}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border">
                    <QRCodeCanvas value={`TICKET-${orderId}-${index + 1}`} size={128} level="H" includeMargin={true} />
                    <p className="text-center text-xs text-gray-500 mt-1">{`A-${orderId.slice(-6).toUpperCase()}`}</p>
                  </div>
                </div>
                {index < orderData.quantity - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">
                    {orderData.quantity} x Entradas para {eventData?.name}
                  </p>
                </div>
                <p className="font-medium">
                  ${ticketData?.price ? (ticketData.price * orderData.quantity).toFixed(2) : "0.00"}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total parcial</span>
                <span>{ticketData?.price ? `$${(ticketData.price * orderData.quantity).toFixed(2)}` : "Gratis"}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{ticketData?.price ? `$${orderData.total.toFixed(2)}` : "Gratis"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

