"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import supabase from "../api/supabase"
import { ArrowLeft, Printer } from "lucide-react"
import { toast } from "react-hot-toast"

function ConfirmationPage() {
  const { eventId, ticketId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)

  // Datos del comprador, asistentes y amenidades
  const [buyerData, setBuyerData] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState({})

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Obtener datos del evento
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (eventError) throw eventError

        // Obtener datos del ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", ticketId)
          .single()

        if (ticketError) throw ticketError

        // Obtener amenidades disponibles
        const { data: amenitiesData, error: amenitiesError } = await supabase
          .from("amenities")
          .select("*")
          .eq("event_id", eventId)

        if (amenitiesError) throw amenitiesError

        setEvent(eventData)
        setTicket(ticketData)
        setAmenities(amenitiesData || [])

        // Recuperar datos del localStorage
        const savedBuyerData = localStorage.getItem("buyerData")
        const savedAttendees = localStorage.getItem("attendees")
        const savedSelectedAmenities = localStorage.getItem("selectedAmenities")

        if (savedBuyerData && savedAttendees) {
          setBuyerData(JSON.parse(savedBuyerData))
          setAttendees(JSON.parse(savedAttendees))

          if (savedSelectedAmenities) {
            setSelectedAmenities(JSON.parse(savedSelectedAmenities))
          }
        } else {
          // Si no hay datos, redirigir al checkout
          navigate(`/checkout/${eventId}/${ticketId}`)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Error al cargar los datos del evento o ticket")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, ticketId, supabase, navigate])

  const calculateTotal = () => {
    let total = 0

    // Sumar el precio de los tickets
    if (ticket && buyerData) {
      total += Number.parseFloat(ticket.price) * attendees.length
    }

    // Sumar el precio de las amenidades
    Object.keys(selectedAmenities).forEach((attendeeIndex) => {
      Object.keys(selectedAmenities[attendeeIndex] || {}).forEach((amenityId) => {
        const quantity = selectedAmenities[attendeeIndex][amenityId]
        const amenity = amenities.find((a) => a.id.toString() === amenityId.toString())
        if (amenity && quantity > 0) {
          total += Number.parseFloat(amenity.price) * quantity
        }
      })
    })

    return total
  }

  const handleCompleteOrder = async () => {
    try {
      setSubmitting(true)

      // 1. Crear la orden en la tabla orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          name: `${buyerData.firstName} ${buyerData.lastName}`,
          email: buyerData.email,
          second_name: "",
          quantity: attendees.length,
          total: calculateTotal(),
          event_id: eventId,
          ticket_id: ticketId,
          status: "COMPLETED",
        })
        .select()
        .single()

      if (orderError) throw orderError

      const newOrderId = orderData.id
      setOrderId(newOrderId)

      // 2. Actualizar la cantidad disponible de tickets
      if (ticket.quantity > 0) {
        // Solo actualizar si no es ilimitado
        const { error: ticketError } = await supabase
          .from("tickets")
          .update({ quantity: ticket.quantity - attendees.length })
          .eq("id", ticketId)

        if (ticketError) throw ticketError
      }

      // 3. Insertar los asistentes en la tabla attendants
      const attendantsToInsert = attendees.map((attendee) => ({
        name: attendee.firstName,
        second_name: attendee.lastName,
        email: attendee.email,
        status: "ACTIVE",
        order_id: newOrderId,
      }))

      const { data: attendantsData, error: attendantsError } = await supabase
        .from("attendants")
        .insert(attendantsToInsert)
        .select()

      if (attendantsError) throw attendantsError

      // 4. Procesar las amenidades seleccionadas
      const amenitiesAttendees = []

      // Para cada asistente y sus amenidades seleccionadas
      attendantsData.forEach((attendant, index) => {
        const attendeeAmenities = selectedAmenities[index] || {}

        Object.keys(attendeeAmenities).forEach((amenityId) => {
          const quantity = attendeeAmenities[amenityId]
          if (quantity > 0) {
            const amenity = amenities.find((a) => a.id.toString() === amenityId.toString())

            if (amenity) {
              // Añadir a la lista para insertar
              amenitiesAttendees.push({
                amenitie_id: amenityId,
                attendee_id: attendant.id,
                quantity: quantity,
                total: Number.parseFloat(amenity.price) * quantity,
              })

              // Actualizar la cantidad disponible de la amenidad
              if (amenity.quantity > 0) {
                // Solo actualizar si no es ilimitado
                supabase
                  .from("amenities")
                  .update({ quantity: amenity.quantity - quantity })
                  .eq("id", amenityId)
                  .then(({ error }) => {
                    if (error) console.error("Error updating amenity quantity:", error)
                  })
              }
            }
          }
        })
      })

      // Insertar las relaciones amenidades-asistentes
      if (amenitiesAttendees.length > 0) {
        const { error: amenitiesAttendeesError } = await supabase.from("amenities_attendees").insert(amenitiesAttendees)

        if (amenitiesAttendeesError) throw amenitiesAttendeesError
      }

      toast.success("¡Pedido completado con éxito!")

      // Limpiar localStorage después de completar la orden
      localStorage.removeItem("buyerData")
      localStorage.removeItem("attendees")
      localStorage.removeItem("selectedAmenities")
    } catch (error) {
      console.error("Error completing order:", error)
      toast.error("Error al completar el pedido")
      setError("Error al procesar el pedido. Por favor, inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <Link to={`/event/${eventId}`} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al evento
          </Link>
        </div>
      </div>
    )
  }

  // Si ya se completó la orden, mostrar la confirmación
  if (orderId) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-green-600 mb-2">{event?.name}</h1>
              <p className="text-xl font-medium text-green-600">Pedido completado</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Detalles del pedido</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">
                    {buyerData?.firstName} {buyerData?.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Pedir Referencia</p>
                  <p className="font-medium">{orderId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-medium">{buyerData?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Fecha de orden</p>
                  <p className="font-medium">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

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

              <div className="space-y-4">
                {attendees.map((attendee, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">
                          {attendee.firstName} {attendee.lastName}
                        </h3>
                        <p className="text-gray-600 text-sm">{attendee.email}</p>
                        <p className="text-sm mt-1">Entrada {ticket?.name}</p>
                      </div>

                      <div className="flex items-center justify-center w-24 h-24 border">
                        {/* Aquí iría un código QR real */}
                        <div className="text-xs text-center">Código QR</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <p>
                    {attendees.length} x {ticket?.name}
                  </p>
                  <p>${(Number.parseFloat(ticket?.price || 0) * attendees.length).toFixed(2)}</p>
                </div>

                {/* Mostrar amenidades seleccionadas */}
                {Object.keys(selectedAmenities).map((attendeeIndex) => {
                  const attendeeAmenities = selectedAmenities[attendeeIndex]
                  return Object.keys(attendeeAmenities || {})
                    .map((amenityId) => {
                      const quantity = attendeeAmenities[amenityId]
                      const amenity = amenities.find((a) => a.id.toString() === amenityId.toString())

                      if (amenity && quantity > 0) {
                        return (
                          <div key={`${attendeeIndex}-${amenityId}`} className="flex justify-between">
                            <p>
                              {quantity} x {amenity.name}
                            </p>
                            <p>${(Number.parseFloat(amenity.price) * quantity).toFixed(2)}</p>
                          </div>
                        )
                      }
                      return null
                    })
                    .filter(Boolean)
                })}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>${calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to={`/event/${eventId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al evento
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link
          to={`/amenities/${eventId}/${ticketId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a amenidades
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Confirmar pedido</h2>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Datos del comprador</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>
                <span className="font-medium">Nombre:</span> {buyerData?.firstName} {buyerData?.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {buyerData?.email}
              </p>
              <p>
                <span className="font-medium">Cantidad:</span> {attendees.length}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Asistentes</h3>
            <div className="space-y-4">
              {attendees.map((attendee, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium">Asistente {index + 1}</p>
                  <p>
                    {attendee.firstName} {attendee.lastName}
                  </p>
                  <p className="text-gray-600">{attendee.email}</p>

                  {/* Mostrar amenidades seleccionadas para este asistente */}
                  {Object.keys(selectedAmenities[index] || {})
                    .map((amenityId) => {
                      const quantity = selectedAmenities[index][amenityId]
                      const amenity = amenities.find((a) => a.id.toString() === amenityId.toString())

                      if (amenity && quantity > 0) {
                        return (
                          <div key={amenityId} className="mt-2 text-sm">
                            <span className="text-gray-600">
                              {quantity} x {amenity.name}
                            </span>
                          </div>
                        )
                      }
                      return null
                    })
                    .filter(Boolean)}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-8">
            <h3 className="text-lg font-medium mb-2">Resumen del pedido</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <p>
                  {attendees.length} x {ticket?.name}
                </p>
                <p>${(Number.parseFloat(ticket?.price || 0) * attendees.length).toFixed(2)}</p>
              </div>

              {/* Mostrar amenidades seleccionadas */}
              {Object.keys(selectedAmenities).map((attendeeIndex) => {
                const attendeeAmenities = selectedAmenities[attendeeIndex]
                return Object.keys(attendeeAmenities || {})
                  .map((amenityId) => {
                    const quantity = attendeeAmenities[amenityId]
                    const amenity = amenities.find((a) => a.id.toString() === amenityId.toString())

                    if (amenity && quantity > 0) {
                      return (
                        <div key={`${attendeeIndex}-${amenityId}`} className="flex justify-between">
                          <p>
                            {quantity} x {amenity.name}
                          </p>
                          <p>${(Number.parseFloat(amenity.price) * quantity).toFixed(2)}</p>
                        </div>
                      )
                    }
                    return null
                  })
                  .filter(Boolean)
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>${calculateTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Link
              to={`/amenities/${eventId}/${ticketId}`}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
            >
              Atrás
            </Link>

            <button
              type="button"
              onClick={handleCompleteOrder}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
              disabled={submitting}
            >
              Completar compra
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationPage

