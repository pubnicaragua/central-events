"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2 } from "lucide-react"
import { StatsCards } from "./stats-cards"
import { TicketSalesChart } from "./ticket-sales-chart"
import { RevenueChart } from "./revenue-chart"
import { getDashboardStats, getTicketSalesData, getRevenueData } from "@actions/dashboard"

export function DashboardPage({ eventId }) {
  const [stats, setStats] = useState({
    ticketsSold: 0,
    grossSales: 0,
    attendeeCount: 0,
    ordersCreated: 0,
  })
  const [ticketSales, setTicketSales] = useState([])
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)

        const [statsData, ticketSalesData, revenueData] = await Promise.all([
          getDashboardStats(eventId),
          getTicketSalesData(eventId),
          getRevenueData(eventId),
        ])

        setStats(statsData)
        setTicketSales(ticketSalesData)
        setRevenue(revenueData)
      } catch (err) {
        console.error("Dashboard data fetch error:", err)
        setError(err instanceof Error ? err.message : "Error loading dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchDashboardData()
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <div className="font-medium text-destructive">Error</div>
        </div>
        <div className="mt-2 text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCards stats={stats} />
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Venta de boletos</TabsTrigger>
          <TabsTrigger value="revenue">Ganancia</TabsTrigger>
        </TabsList>
        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Venta de boletos</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <TicketSalesChart data={ticketSales} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ganancia</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueChart data={revenue} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

