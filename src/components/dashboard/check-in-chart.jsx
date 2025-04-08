"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import supabase from "../../api/supabase"

export function CheckInChart({ eventId }) {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalAttendees, setTotalAttendees] = useState(0)
    const [checkedInCount, setCheckedInCount] = useState(0)

    useEffect(() => {
        async function fetchCheckInData() {
            try {
                setLoading(true)

                // Obtener información del evento para las fechas
                const { data: eventData, error: eventError } = await supabase
                    .from("events")
                    .select("start_date, end_date")
                    .eq("id", eventId)
                    .single()

                if (eventError) throw eventError

                // Obtener todos los asistentes del evento
                const { data: attendants, error: attendantsError } = await supabase
                    .from("attendants")
                    .select(`
            id,
            checked_in,
            checked_in_at,
            event_id
          `)
                    .eq("event_id", eventId)

                if (attendantsError) throw attendantsError

                setTotalAttendees(attendants.length)

                // Contar asistentes con check-in
                const checkedIn = attendants.filter((a) => a.checked_in).length
                setCheckedInCount(checkedIn)

                // Preparar datos para el gráfico por hora
                const startDate = new Date(eventData.start_date)
                const endDate = new Date(eventData.end_date)

                // Si no hay fechas definidas, usar el día actual
                if (!startDate || !endDate) {
                    const today = new Date()
                    const startDate = new Date(today.setHours(0, 0, 0, 0))
                    const endDate = new Date(today.setHours(23, 59, 59, 999))
                }

                // Crear buckets por hora
                const hourlyData = {}
                const startHour = startDate.getHours()
                const endHour = endDate.getHours()

                // Inicializar buckets con ceros
                for (let hour = startHour; hour <= endHour; hour++) {
                    hourlyData[hour] = 0
                }

                // Contar check-ins por hora
                attendants.forEach((attendant) => {
                    if (attendant.checked_in && attendant.checked_in_at) {
                        const checkInTime = new Date(attendant.checked_in_at)
                        const hour = checkInTime.getHours()
                        if (hourlyData[hour] !== undefined) {
                            hourlyData[hour]++
                        }
                    }
                })

                // Formatear datos para el gráfico
                const formattedData = Object.entries(hourlyData).map(([hour, count]) => ({
                    hour: `${hour}:00`,
                    count,
                }))

                setChartData(formattedData)
            } catch (err) {
                console.error("Error fetching check-in data:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchCheckInData()

        // Suscribirse a cambios en attendants
        const channel = supabase
            .channel("checkin_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "attendants",
                    filter: `event_id=eq.${eventId}`,
                },
                (payload) => {
                    // Actualizar los datos cuando hay cambios
                    fetchCheckInData()
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
                    <CardTitle>Progreso de Check-in</CardTitle>
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
                    <CardTitle>Progreso de Check-in</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-destructive">Error: {error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progreso de Check-in</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 text-center">
                    <div className="text-2xl font-bold">
                        {checkedInCount} de {totalAttendees}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {totalAttendees > 0
                            ? `${Math.round((checkedInCount / totalAttendees) * 100)}% de asistentes registrados`
                            : "No hay asistentes registrados"}
                    </div>
                </div>

                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10b981" name="Check-ins" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

