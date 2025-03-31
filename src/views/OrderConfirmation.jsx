"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import supabase from "../api/supabase"
import { ArrowLeft, Printer, Download, MapPin, Calendar, Clock } from "lucide-react"
import { toast } from "react-hot-toast"
import { QRCodeCanvas } from "qrcode.react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [event, setEvent] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [location, setLocation] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [amenitiesByAttendee, setAmenitiesByAttendee] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const pdfRef = useRef(null)

  useEffect(() => {
    async function fetchOrderData() {
      try {
        setLoading(true)

        // Obtener datos de la orden
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

        if (orderError) throw orderError

        setOrder(orderData)

        // Obtener datos del evento
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", orderData.event_id)
          .single()

        if (eventError) throw eventError

        setEvent(eventData)

        // Obtener datos del ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", orderData.ticket_id)
          .single()

        if (ticketError) throw ticketError

        setTicket(ticketData)

        // Obtener datos de la ubicación
        const { data: eventConfigData, error: eventConfigError } = await supabase
          .from("event_configs")
          .select(`
            *,
            location:location_id(*)
          `)
          .eq("event_id", orderData.event_id)
          .single()

        if (!eventConfigError && eventConfigData?.location) {
          setLocation(eventConfigData.location)
        }

        // Obtener datos de los asistentes
        const { data: attendeesData, error: attendeesError } = await supabase
          .from("attendants")
          .select("*")
          .eq("order_id", orderId)

        if (attendeesError) throw attendeesError

        setAttendees(attendeesData || [])

        // Obtener amenidades por asistente
        const amenitiesByAttendeeMap = {}

        for (const attendee of attendeesData || []) {
          const { data: amenitiesData, error: amenitiesError } = await supabase
            .from("amenities_attendees")
            .select(`
              *,
              amenity:amenitie_id(*)
            `)
            .eq("attendee_id", attendee.id)

          if (!amenitiesError && amenitiesData) {
            amenitiesByAttendeeMap[attendee.id] = amenitiesData
          }
        }

        setAmenitiesByAttendee(amenitiesByAttendeeMap)
      } catch (err) {
        console.error("Error fetching order data:", err)
        setError("Error al cargar los datos del pedido")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderData()
    }
  }, [orderId, supabase])

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  const calculateTotalAmenities = (attendeeId) => {
    const amenities = amenitiesByAttendee[attendeeId] || []
    return amenities.reduce((total, item) => {
      return total + (Number.parseFloat(item.total) || 0)
    }, 0)
  }

  const calculateGrandTotal = () => {
    // Precio base de los tickets
    const ticketTotal = Number.parseFloat(ticket?.price || 0) * attendees.length

    // Sumar todas las amenidades
    let amenitiesTotal = 0
    Object.keys(amenitiesByAttendee).forEach((attendeeId) => {
      amenitiesTotal += calculateTotalAmenities(attendeeId)
    })

    return ticketTotal + amenitiesTotal
  }

  const generateQRData = (attendee) => {
    return JSON.stringify({
      attendeeId: attendee.id,
      orderId: orderId,
      name: attendee.name,
      secondName: attendee.second_name,
      email: attendee.email,
      eventId: event?.id,
      eventName: event?.name,
      ticketName: ticket?.name,
    })
  }

  const handleExportPDF = async () => {
    try {
      const content = pdfRef.current

      if (!content) {
        toast.error("No se pudo generar el PDF")
        return
      }

      toast.loading("Generando PDF...")

      const canvas = await html2canvas(content, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`orden-${orderId}.pdf`)

      toast.dismiss()
      toast.success("PDF generado correctamente")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.dismiss()
      toast.error("Error al generar el PDF")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  if (error || !order || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error || "No se encontró la orden solicitada"}</p>
          <Link to="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Link to={`/event/${event.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al evento
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        <div ref={pdfRef} className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.name}</h1>
            <p className="text-xl font-medium text-green-600">Pedido completado</p>
          </div>

          {/* Detalles del evento */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Detalles del evento</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Fecha y hora</p>
                  <p className="text-gray-600">{formatDate(event.start_date)}</p>
                  {event.end_date && event.end_date !== event.start_date && (
                    <p className="text-gray-600">Hasta: {formatDate(event.end_date)}</p>
                  )}
                </div>
              </div>

              {location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium">{location.name || "Ubicación"}</p>
                    {!location.is_online ? (
                      <>
                        <p className="text-gray-600">{location.address}</p>
                        {location.second_address && <p className="text-gray-600">{location.second_address}</p>}
                        <p className="text-gray-600">
                          {[location.city, location.state, location.postal_code].filter(Boolean).join(", ")}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-600">Evento en línea</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Descripción</p>
                  <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del pedido */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Detalles del pedido</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{order.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Referencia</p>
                <p className="font-medium">{order.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="font-medium">{order.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Fecha de orden</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Huéspedes */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Huéspedes</h2>
              <button
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir todas las entradas
              </button>
            </div>

            <div className="space-y-6">
              {attendees.map((attendee, index) => (
                <div key={attendee.id} className="border p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-medium">
                        {attendee.name} {attendee.second_name}
                      </h3>
                      <p className="text-gray-600">{attendee.email}</p>
                      <p className="text-sm mt-1">Entrada: {ticket?.name}</p>

                      {/* Amenidades del asistente */}
                      {amenitiesByAttendee[attendee.id]?.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-sm">Amenidades:</p>
                          <ul className="text-sm text-gray-600 mt-1">
                            {amenitiesByAttendee[attendee.id].map((item) => (
                              <li key={item.id}>
                                {item.quantity} x {item.amenity?.name} - ${Number.parseFloat(item.total).toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <QRCodeCanvas
                        value={generateQRData(attendee)}
                        size={120}
                        level="H"
                        renderAs="svg"
                        includeMargin={true}
                      />
                      <p className="text-xs text-center mt-2">A-{attendee.id}</p>
                      <p className="text-xs text-center text-gray-500">
                        {attendee.status === "ACTIVE" ? "No confirmado" : "Confirmado"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <p>
                  {attendees.length} x {ticket?.name}
                </p>
                <p>${(Number.parseFloat(ticket?.price || 0) * attendees.length).toFixed(2)}</p>
              </div>

              {/* Mostrar amenidades agrupadas */}
              {Object.keys(amenitiesByAttendee).map((attendeeId) => {
                const attendee = attendees.find((a) => a.id.toString() === attendeeId.toString())
                const amenities = amenitiesByAttendee[attendeeId] || []

                if (amenities.length === 0) return null

                return (
                  <div key={attendeeId} className="mt-2">
                    <p className="text-sm font-medium">
                      Amenidades para {attendee?.name} {attendee?.second_name}:
                    </p>
                    {amenities.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm pl-4">
                        <p>
                          {item.quantity} x {item.amenity?.name}
                        </p>
                        <p>${Number.parseFloat(item.total).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>${calculateGrandTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage

