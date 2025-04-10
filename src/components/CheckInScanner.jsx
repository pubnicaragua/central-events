"use client"

import { useState, useRef, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import supabase from "../api/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Loader2, CheckCircle2, User, Mail, Ticket, MinusCircle } from "lucide-react"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import useAuth from "../hooks/useAuth"

const CheckInScanner = ({ eventId, onSuccess }) => {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [attendee, setAttendee] = useState(null)
  const [amenities, setAmenities] = useState([])
  const [activeTab, setActiveTab] = useState("check-in")
  const [loadingAmenities, setLoadingAmenities] = useState(false)
  const [amenityUpdating, setAmenityUpdating] = useState({})
  const [quantities, setQuantities] = useState({})
  const [hasAssignedAmenities, setHasAssignedAmenities] = useState(false)
  const [autoReduceResult, setAutoReduceResult] = useState(null)
  const scannerRef = useRef(null)
  const { user } = useAuth()

  // Check if employee has assigned amenities when component mounts
  useEffect(() => {
    if (user?.id) {
      checkEmployeeHasAssignedAmenities(user.id)
        .then((result) => {
          setHasAssignedAmenities(result)
          // Set the default active tab based on whether the employee has assigned amenities
          setActiveTab(result ? "amenities" : "check-in")
        })
        .catch((err) => console.error("Error checking employee amenities:", err))
    }
  }, [user])

  const checkEmployeeHasAssignedAmenities = async (userId) => {
    try {
      if (!userId) return false

      const { data, error } = await supabase.from("amenities").select("id").eq("user_id", userId).limit(1)

      if (error) throw error
      return data && data.length > 0
    } catch (err) {
      console.error("Error checking employee amenities:", err)
      return false
    }
  }

  const autoReduceAmenity = async (attendeeId, userId) => {
    try {
      // Get amenities assigned to this employee
      const { data: employeeAmenities, error: amenitiesError } = await supabase
        .from("amenities")
        .select("id")
        .eq("user_id", userId)

      if (amenitiesError) throw amenitiesError

      if (!employeeAmenities || employeeAmenities.length === 0) return false

      // Get the attendee's amenities that match this employee's assigned amenities
      const { data: attendeeAmenities, error: attendeeAmenitiesError } = await supabase
        .from("amenities_attendees")
        .select("id, quantity, amenities(id, name)")
        .eq("attendee_id", attendeeId)
        .gt("quantity", 0)

      if (attendeeAmenitiesError) throw attendeeAmenitiesError

      if (!attendeeAmenities || attendeeAmenities.length === 0) return false

      // Filter to only include amenities assigned to this employee
      const matchingAmenities = attendeeAmenities.filter((item) =>
        employeeAmenities.some((ea) => ea.id === item.amenities.id),
      )

      if (matchingAmenities.length === 0) return false

      // Reduce the first available amenity by 1
      const amenityToReduce = matchingAmenities[0]

      const { error: updateError } = await supabase
        .from("amenities_attendees")
        .update({
          quantity: amenityToReduce.quantity - 1,
        })
        .eq("id", amenityToReduce.id)

      if (updateError) throw updateError

      return {
        success: true,
        amenityName: amenityToReduce.amenities.name,
        newQuantity: amenityToReduce.quantity - 1,
      }
    } catch (err) {
      console.error("Error auto-reducing amenity:", err)
      return false
    }
  }

  const startScanner = () => {
    setScanning(true)
    setError(null)
    setSuccess(false)
    setResult(null)
    setAttendee(null)
    setAmenities([])
    setQuantities({})
    setAutoReduceResult(null)

    try {
      // Crear el escáner solo si no existe
      if (!scannerRef.current) {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: 250,
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
          },
          /* verbose= */ false,
        )

        html5QrcodeScanner.render(
          (decodedText) => {
            // Éxito en el escaneo
            handleScan(decodedText)

            // Detener el escáner después de un escaneo exitoso
            if (html5QrcodeScanner.getState() === 2) {
              // 2 = SCANNING
              html5QrcodeScanner.pause()
            }
          },
          (errorMessage) => {
            // Ignorar errores comunes de escaneo que no son críticos
            if (!errorMessage.includes("No MultiFormat Readers")) {
              setError(`Error al escanear: ${errorMessage}`)
            }
          },
        )

        scannerRef.current = html5QrcodeScanner
      } else {
        // Si ya existe, resumir el escaneo
        if (scannerRef.current.getState() === 3) {
          // 3 = PAUSED
          scannerRef.current.resume()
        }
      }
    } catch (err) {
      console.error("Error al iniciar el escáner:", err)
      setError("No se pudo iniciar el escáner. Por favor, intenta de nuevo.")
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.getState() === 2) {
          // 2 = SCANNING
          scannerRef.current.pause()
        }
      } catch (err) {
        console.error("Error al detener el escáner:", err)
      }
    }
    setScanning(false)
  }

  const handleScan = async (data) => {
    try {
      setLoading(true)
      setError(null)
      setAutoReduceResult(null)

      // Intentar parsear los datos del QR
      let qrData
      try {
        qrData = JSON.parse(data)
      } catch (err) {
        throw new Error("Código QR inválido. No se pudo leer la información.")
      }

      // Verificar que el QR contiene los datos necesarios
      if (!qrData.attendeeId || !qrData.eventId) {
        throw new Error("Código QR inválido. Falta información necesaria.")
      }

      // Verificar que el QR pertenece a este evento
      if (qrData.eventId !== eventId) {
        throw new Error("Este código QR pertenece a otro evento.")
      }

      setResult(qrData)

      // Buscar al asistente en la base de datos
      const { data: attendeeData, error: attendeeError } = await supabase
        .from("attendants")
        .select("*, tickets(*)")
        .eq("id", qrData.attendeeId)
        .eq("event_id", eventId)
        .single()

      if (attendeeError) {
        throw new Error("No se encontró el asistente en la base de datos.")
      }

      setAttendee(attendeeData)

      // Verificar si el empleado tiene amenidades asignadas
      const hasAmenities = await checkEmployeeHasAssignedAmenities(user?.id)
      setHasAssignedAmenities(hasAmenities)

      // Cargar las amenidades del asistente
      await fetchAttendeeAmenities(qrData.attendeeId)

      // Lógica basada en si el empleado tiene amenidades asignadas
      if (hasAmenities) {
        // Si el empleado tiene amenidades asignadas, no puede hacer check-in
        // Verificar si el asistente ya hizo check-in
        if (!attendeeData.checked_in) {
          throw new Error("El asistente debe hacer check-in primero con un empleado de registro.")
        } else {
          // Si ya hizo check-in, reducir automáticamente la amenidad
          const result = await autoReduceAmenity(qrData.attendeeId, user?.id)
          if (result && result.success) {
            setAutoReduceResult(result)
            setActiveTab("amenities") // Cambiar a la pestaña de amenidades
            setSuccess(true)
          } else {
            throw new Error("Ya no tienes amenidades disponibles. Verifica con el organizador si tienes, si el código QR falla, puede hacerlo manualmente.")
          }
        }
      } else {
        // Si el empleado no tiene amenidades asignadas, solo puede hacer check-in
        if (!attendeeData.checked_in) {
          // Actualizar el estado de check-in
          const { error: updateError } = await supabase
            .from("attendants")
            .update({
              checked_in: true,
              checked_in_at: new Date().toISOString(),
            })
            .eq("id", qrData.attendeeId)

          if (updateError) {
            throw new Error("Error al actualizar el estado de check-in.")
          }

          // Actualizar el estado local del asistente
          setAttendee({
            ...attendeeData,
            checked_in: true,
            checked_in_at: new Date().toISOString(),
          })
        }
        setSuccess(true)
      }

      if (onSuccess) onSuccess(attendeeData)
    } catch (err) {
      console.error("Error en el check-in:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendeeAmenities = async (attendeeId) => {
    try {
      setLoadingAmenities(true)

      // Obtener las amenidades del asistente, filtrando por el usuario actual si no es admin
      const { data: userRoles } = await supabase.from("user_roles").select("role_id").eq("user_id", user?.id).single()

      const isAdmin = userRoles?.role_id === 1

      // Obtener las amenidades del asistente
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from("amenities_attendees")
        .select(`
          id,
          quantity,
          total,
          is_active,
          amenities (
            id,
            name,
            description,
            price,
            section_id,
            user_id,
            amenities_sections (
              id,
              name,
              is_default
            )
          )
        `)
        .eq("attendee_id", attendeeId)

      if (amenitiesError) throw amenitiesError

      // Filtrar amenidades por usuario si no es admin
      let filteredAmenities = amenitiesData
      if (!isAdmin && user?.id) {
        filteredAmenities = amenitiesData.filter((item) => item.amenities.user_id === user.id)
      }

      // Inicializar el estado de cantidades
      const initialQuantities = {}
      filteredAmenities.forEach((item) => {
        initialQuantities[item.id] = 0
      })
      setQuantities(initialQuantities)

      // Agrupar por sección
      const grouped = {}
      filteredAmenities.forEach((item) => {
        const section = item.amenities?.amenities_sections
        if (!section) return

        if (!grouped[section.id]) {
          grouped[section.id] = {
            section: section,
            amenities: [],
          }
        }

        grouped[section.id].amenities.push({
          id: item.id,
          amenityId: item.amenities.id,
          name: item.amenities.name,
          description: item.amenities.description,
          quantity: item.quantity,
          total: item.total,
          is_active: item.is_active,
          price: item.amenities.price,
          user_id: item.amenities.user_id,
        })
      })

      setAmenities(Object.values(grouped))
    } catch (error) {
      console.error("Error al cargar las amenidades del asistente:", error)
      setError("Error al cargar las amenidades. Por favor, intenta de nuevo.")
    } finally {
      setLoadingAmenities(false)
    }
  }

  const handleQuantityChange = (amenityId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [amenityId]: Math.max(0, Number.parseInt(value) || 0),
    }))
  }

  const updateAmenityQuantity = async (amenityId, currentQuantity, quantityToReduce) => {
    if (quantityToReduce <= 0) return

    if (quantityToReduce > currentQuantity) {
      setError(`No puedes reducir más de ${currentQuantity} unidades disponibles.`)
      return
    }

    try {
      setAmenityUpdating((prev) => ({ ...prev, [amenityId]: true }))

      // Verificar si el usuario tiene permiso para esta amenidad
      const amenityToUpdate = amenities.flatMap((section) => section.amenities).find((a) => a.id === amenityId)

      if (amenityToUpdate && amenityToUpdate.user_id && amenityToUpdate.user_id !== user?.id) {
        throw new Error("No tienes permiso para actualizar esta amenidad")
      }

      // Actualizar la cantidad en la base de datos
      const { error } = await supabase
        .from("amenities_attendees")
        .update({
          quantity: currentQuantity - quantityToReduce,
        })
        .eq("id", amenityId)

      if (error) throw error

      // Actualizar la UI
      setAmenities((prevAmenities) => {
        return prevAmenities.map((section) => ({
          ...section,
          amenities: section.amenities.map((amenity) =>
            amenity.id === amenityId ? { ...amenity, quantity: currentQuantity - quantityToReduce } : amenity,
          ),
        }))
      })

      // Resetear la cantidad en el input
      setQuantities((prev) => ({
        ...prev,
        [amenityId]: 0,
      }))
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error)
      setError("Error al actualizar la cantidad. Por favor, intenta de nuevo.")
    } finally {
      setAmenityUpdating((prev) => ({ ...prev, [amenityId]: false }))
    }
  }

  // Configurar suscripción en tiempo real para cambios en amenities_attendees
  useEffect(() => {
    if (attendee?.id) {
      const amenitiesSubscription = supabase
        .channel(`amenities-changes-${attendee.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "amenities_attendees",
            filter: `attendee_id=eq.${attendee.id}`,
          },
          () => {
            // Cuando hay cambios en las amenidades del asistente, recargarlas
            fetchAttendeeAmenities(attendee.id)
          },
        )
        .subscribe()

      return () => {
        amenitiesSubscription.unsubscribe()
      }
    }
  }, [attendee?.id])

  // Limpiar el escáner cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (err) {
          console.error("Error al limpiar el escáner:", err)
        }
        scannerRef.current = null
      }
    }
  }, [])

  // Renderizar el contenido de la tarjeta según si el empleado tiene amenidades asignadas
  const renderCardContent = () => {
    if (!success || !attendee) return null

    if (hasAssignedAmenities) {
      // Si el empleado tiene amenidades asignadas, solo mostrar la pestaña de amenidades
      return (
        <>
          <CardContent>
            <h3 className="font-medium text-lg mb-4">Gestión de Amenidades</h3>

            {loadingAmenities ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Cargando amenidades...</span>
              </div>
            ) : amenities.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No hay amenidades asignadas a este asistente que puedas gestionar
              </div>
            ) : (
              <div className="space-y-6">
                {autoReduceResult && (
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Amenidad reducida automáticamente</AlertTitle>
                    <AlertDescription>Se ha reducido 1 unidad de {autoReduceResult.amenityName}</AlertDescription>
                  </Alert>
                )}

                {amenities.map((group) => (
                  <div key={group.section.id} className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{group.section.name}</h3>
                        {group.section.is_default && (
                          <Badge variant="outline" className="mt-1">
                            Sección predeterminada
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="divide-y">
                      {group.amenities.map((amenity) => (
                        <div key={amenity.id} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{amenity.name}</div>
                              {amenity.description && (
                                <div className="text-sm text-gray-500">{amenity.description}</div>
                              )}
                            </div>
                            <div className="text-right">
                              {amenity.price > 0 && <div className="font-medium">${amenity.price.toFixed(2)}</div>}
                              <Badge
                                className={`${amenity.quantity > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                              >
                                {amenity.quantity} disponible{amenity.quantity !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </div>

                          {amenity.quantity > 0 && (
                            <div className="flex flex-col gap-2 mt-3">
                              <p className="text-xs text-gray-500 mb-1">
                                Da click aquí por si el QR no funciona correctamente.
                              </p>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`quantity-${amenity.id}`} className="sr-only">
                                  Cantidad a consumir
                                </Label>
                                <Input
                                  id={`quantity-${amenity.id}`}
                                  type="number"
                                  min="0"
                                  max={amenity.quantity}
                                  value={quantities[amenity.id] || 0}
                                  onChange={(e) => handleQuantityChange(amenity.id, e.target.value)}
                                  className="w-20"
                                />
                                <Button
                                  onClick={() =>
                                    updateAmenityQuantity(amenity.id, amenity.quantity, quantities[amenity.id])
                                  }
                                  disabled={!quantities[amenity.id] || amenityUpdating[amenity.id]}
                                  size="sm"
                                >
                                  {amenityUpdating[amenity.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <MinusCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Consumir
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </>
      )
    } else {
      // Si el empleado no tiene amenidades asignadas, solo mostrar la pestaña de información
      return (
        <>
          <CardContent>
            <h3 className="font-medium text-lg mb-2">Información del asistente</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {attendee.name} {attendee.second_name || ""}
                  </p>
                </div>
              </div>

              {attendee.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p>{attendee.email}</p>
                </div>
              )}

              {attendee.tickets && (
                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p>{attendee.tickets.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </>
      )
    }
  }

  return (
    <div className="space-y-4">
      {!scanning && !success && !loading && (
        <Button onClick={startScanner} className="w-full">
          Iniciar escáner
        </Button>
      )}

      {scanning && !success && !loading && (
        <Button onClick={stopScanner} variant="outline" className="w-full">
          Cancelar
        </Button>
      )}

      {/* Contenedor del escáner */}
      <div className={`scanner-container ${scanning ? "block" : "hidden"}`}>
        <div id="qr-reader" className="w-full"></div>
      </div>

      {/* Mensaje de carga */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Verificando...</span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Información del asistente después del check-in */}
      {success && attendee && (
        <Card>
          <CardHeader className="bg-green-50">
            <div className="flex items-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <CardTitle>{hasAssignedAmenities ? "Amenidad reducida" : "Check-in exitoso"}</CardTitle>
                <CardDescription>
                  {hasAssignedAmenities
                    ? autoReduceResult
                      ? `Se ha reducido 1 unidad de ${autoReduceResult.amenityName}`
                      : "El asistente ha sido verificado correctamente."
                    : "El asistente ha sido registrado correctamente."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {renderCardContent()}

          <CardFooter className="pt-2 pb-4">
            <Button
              onClick={() => {
                setSuccess(false)
                setAttendee(null)
                setResult(null)
                setAmenities([])
                setQuantities({})
                setAutoReduceResult(null)
                startScanner()
              }}
              className="w-full"
            >
              Escanear otro código
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

export default CheckInScanner
