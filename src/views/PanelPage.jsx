"use client"
import { Line, LineChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data - replace with real data
const ordersData = [
  { date: "Feb 07", orders: 2, tickets: 3 },
  { date: "Feb 08", orders: 1, tickets: 2 },
  { date: "Feb 09", orders: 3, tickets: 4 },
  { date: "Feb 10", orders: 2, tickets: 2 },
  { date: "Feb 11", orders: 4, tickets: 6 },
  { date: "Feb 12", orders: 3, tickets: 4 },
  { date: "Feb 13", orders: 5, tickets: 7 },
  { date: "Feb 14", orders: 4, tickets: 5 },
]

const revenueData = [
  { date: "Feb 07", fees: 0, sales: 0, taxes: 0 },
  { date: "Feb 08", fees: 0, sales: 0, taxes: 0 },
  { date: "Feb 09", fees: 0, sales: 0, taxes: 0 },
  { date: "Feb 10", fees: 0, sales: 0, taxes: 0 },
  { date: "Feb 11", fees: 0, sales: 0, taxes: 0 },
  { date: "Feb 12", fees: 0, sales: 0, taxes: 0 },
  { date: "Feb 13", fees: 0, sales: 0, taxes: 0 },
  { date: "Feb 14", fees: 0, sales: 0, taxes: 0 },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Actividad</CardTitle>
          <CardDescription>Feb 07 - Feb 14</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[200px]"
            config={{
              orders: {
                label: "Ordenes creadas",
                color: "hsl(var(--primary))",
              },
              tickets: {
                label: "Entradas vendidas",
                color: "hsl(var(--primary)/.3)",
              },
            }}
          >
            <LineChart data={ordersData}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="orders" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tickets" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
          <div className="mt-4 flex items-center justify-start gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Ordenes creadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/30" />
              <span>Entradas vendidas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganancia</CardTitle>
          <CardDescription>Feb 07 - Feb 14</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[200px]"
            config={{
              fees: {
                label: "Tarifas totales",
                color: "hsl(var(--purple-500))",
                valueFormatter: (value) => `$${value.toFixed(2)}`,
              },
              sales: {
                label: "Ventas brutas",
                color: "hsl(var(--purple-300))",
                valueFormatter: (value) => `$${value.toFixed(2)}`,
              },
              taxes: {
                label: "Total impuestos",
                color: "hsl(var(--purple-700))",
                valueFormatter: (value) => `$${value.toFixed(2)}`,
              },
            }}
          >
            <LineChart data={revenueData}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="fees" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sales" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="taxes" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
          <div className="mt-4 flex items-center justify-start gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span>Tarifas totales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-300" />
              <span>Ventas brutas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-700" />
              <span>Total impuestos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

