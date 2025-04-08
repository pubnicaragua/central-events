"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import supabase from "../../api/supabase"

export function AmenitiesConsumptionTable({ eventId }) {
    const [attendees, setAttendees] = useState([])
    const [amenities, setAmenities] = useState([])
    const [amenitiesAttendees, setAmenitiesAttendees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Obtener asistentes del evento
                const { data: attendeesData, error: attendeesError } = await supabase
                    .from("attendants")
                    .select("id, name, second_name, email")
                    .eq("event_id", eventId)
                    .order("name")

                if (attendeesError) throw attendeesError

                // Obtener amenidades del evento
                const { data: amenitiesData, error: amenitiesError } = await supabase
                    .from("amenities")
                    .select("id, name")
                    .eq("event_id", eventId)
                    .order("name")

                if (amenitiesError) throw amenitiesError

                // Obtener asignaciones de amenidades a asistentes
                const { data: amenitiesAttendeesData, error: amenitiesAttendeesError } = await supabase
                    .from("amenities_attendees")
                    .select("id, attendee_id, amenitie_id, quantity, total")
                    .eq("is_active", true)

                if (amenitiesAttendeesError) throw amenitiesAttendeesError

                setAttendees(attendeesData)
                setAmenities(amenitiesData)
                setAmenitiesAttendees(amenitiesAttendeesData)
            } catch (err) {
                console.error("Error fetching data:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        // Suscribirse a cambios en amenities_attendees
        const subscription = supabase
            .channel("amenities_attendees_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "amenities_attendees",
                },
                (payload) => {
                    console.log("Cambio en amenities_attendees:", payload)

                    // Actualizar los datos cuando haya cambios
                    if (payload.eventType === "INSERT") {
                        setAmenitiesAttendees((prev) => [...prev, payload.new])
                    } else if (payload.eventType === "UPDATE") {
                        setAmenitiesAttendees((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)))
                    } else if (payload.eventType === "DELETE") {
                        setAmenitiesAttendees((prev) => prev.filter((item) => item.id !== payload.old.id))
                    }
                },
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [eventId])

    // Función para obtener la cantidad consumida/disponible de una amenidad para un asistente
    const getAmenityQuantity = (attendeeId, amenityId) => {
        const assignment = amenitiesAttendees.find((aa) => aa.attendee_id === attendeeId && aa.amenitie_id === amenityId)

        if (!assignment) return null

        return {
            current: assignment.quantity,
            total: assignment.total,
        }
    }

    if (loading) return <div>Cargando datos de amenidades...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Consumo de Amenidades por Asistente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Asistente</TableHead>
                                {amenities.map((amenity) => (
                                    <TableHead key={amenity.id}>{amenity.name}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={amenities.length + 1} className="text-center">
                                        No hay asistentes registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attendees.map((attendee) => (
                                    <TableRow key={attendee.id}>
                                        <TableCell className="font-medium">
                                            {attendee.name} {attendee.second_name}
                                            <div className="text-xs text-muted-foreground">{attendee.email}</div>
                                        </TableCell>
                                        {amenities.map((amenity) => {
                                            const quantity = getAmenityQuantity(attendee.id, amenity.id)
                                            return (
                                                <TableCell key={amenity.id}>
                                                    {quantity ? (
                                                        <Badge
                                                            variant={quantity.current > 0 ? "outline" : "destructive"}
                                                            className="whitespace-nowrap"
                                                        >
                                                            {quantity.current} disponibles
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">No asignada</span>
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

