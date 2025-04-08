"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import supabase from "../../api/supabase"

export function AmenityConsumptionCard({ eventId }) {
    const [amenities, setAmenities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchAmenities() {
            try {
                setLoading(true)

                // Obtener todas las amenidades del evento
                const { data: eventAmenities, error: amenitiesError } = await supabase
                    .from("amenities")
                    .select(`
            id,
            name,
            description,
            price
          `)
                    .eq("event_id", eventId)

                if (amenitiesError) throw amenitiesError

                if (!eventAmenities || eventAmenities.length === 0) {
                    setAmenities([])
                    setLoading(false)
                    return
                }

                // Para cada amenidad, obtener el consumo total
                const amenitiesWithConsumption = await Promise.all(
                    eventAmenities.map(async (amenity) => {
                        // Obtener el total asignado
                        const { data: assigned, error: assignedError } = await supabase
                            .from("amenities_attendees")
                            .select("quantity, total")
                            .eq("amenitie_id", amenity.id)

                        if (assignedError) throw assignedError

                        // Calcular totales
                        const totalAssigned = assigned.reduce((sum, item) => sum + (item.total || 0), 0)
                        const totalRemaining = assigned.reduce((sum, item) => sum + (item.quantity || 0), 0)

                        return {
                            ...amenity,
                            totalAssigned,
                            totalRemaining,
                            consumptionPercentage:
                                totalAssigned > 0 ? Math.round(((totalAssigned - totalRemaining) / totalAssigned) * 100) : 0,
                        }
                    }),
                )

                setAmenities(amenitiesWithConsumption)
            } catch (err) {
                console.error("Error fetching amenities:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAmenities()

        // Suscribirse a cambios en amenities_attendees
        const channel = supabase
            .channel("amenities_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "amenities_attendees",
                },
                (payload) => {
                    // Actualizar los datos cuando hay cambios
                    fetchAmenities()
                },
            )
            .subscribe()

        return () => {
            // Limpiar suscripción al desmontar
            supabase.removeChannel(channel)
        }
    }, [eventId])

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Consumo de Amenidades</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Consumo de Amenidades</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-destructive">Error: {error}</div>
                </CardContent>
            </Card>
        )
    }

    if (amenities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Consumo de Amenidades</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No hay amenidades configuradas para este evento.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Consumo de Amenidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {amenities.map((item) => {
                    const remainingPercentage = 100 - item.consumptionPercentage

                    return (
                        <div key={item.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {item.totalRemaining} de {item.totalAssigned} disponibles
                                </div>
                            </div>
                            <Progress value={remainingPercentage} className="h-2" />
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

