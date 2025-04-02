"use client"

import { useState, useRef, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import supabase from "../api/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Loader2, CheckCircle2, User, Mail, Ticket, MinusCircle } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

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
  const scannerRef = useRef(null)

  const startScanner = () => {
    setScanning(true)
    setError(null)
    setSuccess(false)
    setResult(null)
    setAttendee(null)
    setAmenities([])
    setQuantities({})

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

      // Cargar las amenidades del asistente
      await fetchAttendeeAmenities(qrData.attendeeId)

      // Verificar si ya hizo check-in
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
      }

      setSuccess(true)
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
            amenities_sections (
              id,
              name,
              is_default
            )
          )
        `)
        .eq("attendee_id", attendeeId)

      if (amenitiesError) throw amenitiesError

      // Inicializar el estado de cantidades
      const initialQuantities = {}
      amenitiesData.forEach((item) => {
        initialQuantities[item.id] = 0
      })
      setQuantities(initialQuantities)

      // Agrupar por sección
      const grouped = {}
      amenitiesData.forEach((item) => {
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
                <CardTitle>Check-in exitoso</CardTitle>
                <CardDescription>El asistente ha sido registrado correctamente.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="check-in">Información</TabsTrigger>
              <TabsTrigger value="amenities">Amenidades</TabsTrigger>
            </TabsList>

            <TabsContent value="check-in" className="pt-4">
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
            </TabsContent>

            <TabsContent value="amenities">
              <CardContent>
                <h3 className="font-medium text-lg mb-4">Gestión de Amenidades</h3>

                {loadingAmenities ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando amenidades...</span>
                  </div>
                ) : amenities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">Este asistente no tiene amenidades asignadas</div>
                ) : (
                  <div className="space-y-6">
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
                                <div className="flex items-center gap-2 mt-3">
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
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="pt-2 pb-4">
            <Button
              onClick={() => {
                setSuccess(false)
                setAttendee(null)
                setResult(null)
                setAmenities([])
                setQuantities({})
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

