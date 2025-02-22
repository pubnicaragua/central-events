"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2 } from "lucide-react"
import { StatsCards } from "./stats-cards"
import { TicketSalesChart } from "./ticket-sales-chart"
import { RevenueChart } from "./revenue-chart"
import supabase from "../../api/supabase"

// eslint-disable-next-line react/prop-types
export function DashboardPage({ eventId }) {
  const [stats, setStats] = useState({
    ticketsSold: 0,
    grossSales: 0,
    pageViews: 0,
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

        // Fetch tickets sold
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("quantity")
          .eq("event_id", eventId)

        if (ticketsError) throw new Error("Error fetching tickets data")

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("total")
          .eq("event_id", eventId)

        if (ordersError) throw new Error("Error fetching orders data")

        // Calculate stats
        const totalTickets = ticketsData.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0)
        const totalSales = ordersData.reduce((sum, order) => sum + (order.total || 0), 0)

        setStats({
          ticketsSold: totalTickets,
          grossSales: totalSales,
          pageViews: Math.floor(Math.random() * 500), // Replace with actual analytics data
          ordersCreated: ordersData.length,
        })

        // Fetch historical data for charts
        setTicketSales(generateTicketSalesData())
        setRevenue(generateRevenueData())
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

// Helper functions to generate sample data
function generateTicketSalesData() {
  const data = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString(),
      ordersCreated: Math.floor(Math.random() * 20),
      ticketsSold: Math.floor(Math.random() * 30),
    })
  }
  return data.reverse()
}

function generateRevenueData() {
  const data = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString(),
      totalFees: Math.floor(Math.random() * 50),
      grossSales: Math.floor(Math.random() * 200),
      totalTaxes: Math.floor(Math.random() * 30),
    })
  }
  return data.reverse()
}

