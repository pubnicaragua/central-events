"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Eye, Ticket, DollarSign, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AmenityConsumptionCard } from "../components/dashboard/amenity-consumption-card"
import { CheckInChart } from "../components/dashboard/check-in-chart"
import { AmenitiesConsumptionTable } from "../components/dashboard/amenities-consumption-table"
import supabase from "../api/supabase"

export default function DashboardPage() {
  const { eventId } = useParams()
  const [stats, setStats] = useState({
    ticketsSold: 0,
    grossSales: 0,
    attendeeCount: 0,
    ordersCreated: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Obtener estadísticas de tickets vendidos
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("quantity")
          .eq("event_id", eventId)

        if (ticketsError) throw ticketsError

        // Obtener estadísticas de órdenes
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("id, total")
          .eq("event_id", eventId)

        if (ordersError) throw ordersError

        // Obtener conteo de asistentes
        const { count: attendeeCount, error: attendeeError } = await supabase
          .from("attendants")
          .select("id", { count: "exact" })
          .eq("event_id", eventId)

        if (attendeeError) throw attendeeError

        // Calcular estadísticas
        const ticketsSold = ticketsData.reduce((acc, ticket) => acc + (ticket.quantity || 0), 0)
        const grossSales = ordersData.reduce((acc, order) => acc + (order.total || 0), 0)
        const ordersCreated = ordersData.length

        setStats({
          ticketsSold,
          grossSales,
          attendeeCount,
          ordersCreated,
        })
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchDashboardData()
    }
  }, [eventId])

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Bienvenido de nuevo 👋</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu evento</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas vendidas</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ticketsSold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas brutas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(stats.grossSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistentes</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendeeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes creadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersCreated}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AmenityConsumptionCard eventId={eventId} />
        <CheckInChart eventId={eventId} />
      </div>

      <div className="mt-6">
        <AmenitiesConsumptionTable eventId={eventId} />
      </div>
    </div>
  )
}

