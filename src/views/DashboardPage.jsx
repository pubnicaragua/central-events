"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Eye, Ticket, DollarSign, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "../components/dashboard/StatsCard"
import { TicketSalesChart } from "../components/dashboard/TicketsSalesChart"
import { RevenueChart } from "../components/dashboard/RevenueChart"
import { getDashboardStats, getTicketSalesData, getRevenueData } from "../utils/dashboardUtils"

export function DashboardPage() {
  const { eventId } = useParams()
  const [stats, setStats] = useState(null)
  const [ticketSales, setTicketSales] = useState([])
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await getDashboardStats(eventId)
        const ticketSalesData = await getTicketSalesData(eventId)
        const revenueData = await getRevenueData(eventId)

        setStats(statsData)
        setTicketSales(ticketSalesData)
        setRevenue(revenueData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
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
        <StatsCard title="Entradas vendidas" value={stats.ticketsSold} icon={Ticket} />
        <StatsCard
          title="Ventas brutas"
          value={new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
          }).format(stats.grossSales)}
          icon={DollarSign}
        />
        <StatsCard title="Vistas de página" value={stats.pageViews} icon={Eye} />
        <StatsCard title="Órdenes creadas" value={stats.ordersCreated} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Venta de boletos</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketSalesChart data={ticketSales} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ganancia</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

