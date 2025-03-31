"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import supabase from "../api/supabase"
import { ArrowLeft } from "lucide-react"
import { toast } from "react-hot-toast"

function CheckoutPage() {
  const { eventId, ticketId } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [event, setEvent] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Datos del comprador
  const [buyerData, setBuyerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    quantity: 1,
  })

  // Datos de los asistentes
  const [attendees, setAttendees] = useState([{ firstName: "", lastName: "", email: "" }])

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

        setEvent(eventData)
        setTicket(ticketData)

        // Recuperar datos del localStorage si existen
        const savedBuyerData = localStorage.getItem("buyerData")
        if (savedBuyerData) {
          const parsedData = JSON.parse(savedBuyerData)
          setBuyerData(parsedData)

          // Actualizar la cantidad de asistentes según los datos guardados
          if (parsedData.quantity > 1) {
            setAttendees(
              Array(parsedData.quantity)
                .fill()
                .map((_, i) => ({ firstName: "", lastName: "", email: "" })),
            )
          }
        }

        const savedAttendees = localStorage.getItem("attendees")
        if (savedAttendees) {
          setAttendees(JSON.parse(savedAttendees))
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Error al cargar los datos del evento o ticket")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, ticketId, supabase])

  // Actualizar la cantidad de asistentes cuando cambia la cantidad
  useEffect(() => {
    const newQuantity = Number.parseInt(buyerData.quantity) || 1

    if (newQuantity > attendees.length) {
      // Añadir más asistentes
      const newAttendees = [...attendees]
      for (let i = attendees.length; i < newQuantity; i++) {
        newAttendees.push({ firstName: "", lastName: "", email: "" })
      }
      setAttendees(newAttendees)
    } else if (newQuantity < attendees.length) {
      // Reducir asistentes
      setAttendees(attendees.slice(0, newQuantity))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerData.quantity])

  const handleBuyerChange = (e) => {
    const { name, value } = e.target
    setBuyerData({
      ...buyerData,
      [name]: value,
    })
  }

  const handleAttendeeChange = (index, field, value) => {
    const updatedAttendees = [...attendees]
    updatedAttendees[index] = {
      ...updatedAttendees[index],
      [field]: value,
    }
    setAttendees(updatedAttendees)
  }

  const handleCopyBuyerData = () => {
    // Copiar los datos del comprador al primer asistente
    if (attendees.length > 0) {
      const updatedAttendees = [...attendees]
      updatedAttendees[0] = {
        firstName: buyerData.firstName,
        lastName: buyerData.lastName,
        email: buyerData.email,
      }
      setAttendees(updatedAttendees)
      toast.success("Datos copiados al primer asistente")
    }
  }

  const handleSubmitBuyerInfo = (e) => {
    e.preventDefault()

    // Validar datos del comprador
    if (!buyerData.firstName || !buyerData.lastName || !buyerData.email) {
      toast.error("Por favor completa todos los campos")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(buyerData.email)) {
      toast.error("Por favor ingresa un email válido")
      return
    }

    // Guardar en localStorage
    localStorage.setItem("buyerData", JSON.stringify(buyerData))

    // Avanzar al siguiente paso
    setStep(2)
  }

  const handleSubmitAttendees = (e) => {
    e.preventDefault()

    // Validar datos de los asistentes
    const isValid = attendees.every(
      (attendee) => attendee.firstName && attendee.lastName && attendee.email && /^\S+@\S+\.\S+$/.test(attendee.email),
    )

    if (!isValid) {
      toast.error("Por favor completa todos los campos de los asistentes con datos válidos")
      return
    }

    // Guardar en localStorage
    localStorage.setItem("attendees", JSON.stringify(attendees))

    // Avanzar al siguiente paso (amenidades)
    navigate(`/amenities/${eventId}/${ticketId}`)
  }

  const calculateTotal = () => {
    if (!ticket) return 0
    return Number.parseFloat(ticket.price) * Number.parseInt(buyerData.quantity || 1)
  }

  if (loading) {
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

  if (!event || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Evento o ticket no encontrado</h2>
          <p className="text-gray-700">No se pudo encontrar la información solicitada.</p>
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
      <div className="max-w-6xl mx-auto px-4">
        <Link to={`/event/${eventId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Paso 1: Datos del comprador */}
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Completar orden</h2>
                  <form onSubmit={handleSubmitBuyerInfo}>
                    <div className="mb-4">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={buyerData.firstName}
                        onChange={handleBuyerChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={buyerData.lastName}
                        onChange={handleBuyerChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={buyerData.email}
                        onChange={handleBuyerChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={buyerData.quantity}
                        onChange={handleBuyerChange}
                        min="1"
                        max={ticket.quantity === 0 ? 10 : ticket.quantity}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Máximo {ticket.quantity === 0 ? "ilimitado" : ticket.quantity} tickets disponibles
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      Continuar
                    </button>
                  </form>
                </>
              )}

              {/* Paso 2: Datos de los asistentes */}
              {step === 2 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Detalles de los asistentes</h2>
                  <form onSubmit={handleSubmitAttendees}>
                    {attendees.map((attendee, index) => (
                      <div key={index} className="mb-8 p-6 border rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Asistente {index + 1}</h3>

                        <div className="mb-4">
                          <label
                            htmlFor={`firstName-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Nombre
                          </label>
                          <input
                            type="text"
                            id={`firstName-${index}`}
                            value={attendee.firstName}
                            onChange={(e) => handleAttendeeChange(index, "firstName", e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor={`lastName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Apellido
                          </label>
                          <input
                            type="text"
                            id={`lastName-${index}`}
                            value={attendee.lastName}
                            onChange={(e) => handleAttendeeChange(index, "lastName", e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id={`email-${index}`}
                            value={attendee.email}
                            onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                          />
                        </div>
                      </div>
                    ))}

                    {/* Opción para copiar datos del comprador */}
                    <div className="flex items-center mb-6">
                      <button
                        type="button"
                        onClick={handleCopyBuyerData}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        Copiar detalles del comprador al primer asistente
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                      >
                        Atrás
                      </button>

                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                      >
                        Continuar a amenidades
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Columna de resumen */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-sm text-gray-600">
                      {buyerData.quantity} x ${Number.parseFloat(ticket.price).toFixed(2)}
                    </p>
                    {ticket.quantity !== 0 && <p className="text-xs text-gray-500">{ticket.quantity} disponibles</p>}
                  </div>
                  <p className="font-medium">
                    ${(Number.parseFloat(ticket.price) * Number.parseInt(buyerData.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center font-bold">
                <p>Total</p>
                <p>${calculateTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

