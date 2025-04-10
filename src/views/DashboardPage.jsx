"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Users, Package, Gift, CheckSquare } from "lucide-react"
import {
  getEventDetails,
  getEventAttendees,
  getEventAmenities,
  getAmenitiesAttendees,
  getEventRaffles,
  getRaffleWinners,
  getCheckInStats,
} from "../api/eventService"
import { subscribeToTable, unsubscribeFromChannel } from "../api/realtimeService"
import StatCard from "../components/StatCard"
import ChartCard from "../components/ChartCard"
import { BarChart } from "../components/charts/BarChart"
import { LineChart } from "../components/charts/LineChart"
import { PieChart } from "../components/charts/PieChart"
import AmenityUsageTable from "../components/AmenityUsageTable"
import RaffleWinnersTable from "../components/RaffleWinnersTable"

export default function RealtimeDashboard() {
  const { eventId } = useParams()
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [amenities, setAmenities] = useState([])
  const [amenitiesAttendees, setAmenitiesAttendees] = useState([])
  const [raffles, setRaffles] = useState([])
  const [raffleWinners, setRaffleWinners] = useState([])
  const [checkInStats, setCheckInStats] = useState(null)
  const [error, setError] = useState(null)

  // Función para cargar todos los datos
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      const eventData = await getEventDetails(eventId)
      const attendeesData = await getEventAttendees(eventId)
      const amenitiesData = await getEventAmenities(eventId)
      const amenitiesAttendeesData = await getAmenitiesAttendees(eventId)
      const rafflesData = await getEventRaffles(eventId)
      const raffleWinnersData = await getRaffleWinners(eventId)
      const checkInStatsData = await getCheckInStats(eventId)

      setEvent(eventData)
      setAttendees(attendeesData)
      setAmenities(amenitiesData)
      setAmenitiesAttendees(amenitiesAttendeesData)
      setRaffles(rafflesData)
      setRaffleWinners(raffleWinnersData)
      setCheckInStats(checkInStatsData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Error cargando datos del dashboard. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const attendantsChannel = subscribeToTable("attendants", (payload) => {
      console.log("Cambio en attendants:", payload)
      fetchAllData()
    })

    const amenitiesChannel = subscribeToTable("amenities", (payload) => {
      console.log("Cambio en amenities:", payload)
      fetchAllData()
    })

    const amenitiesAttendeesChannel = subscribeToTable("amenities_attendees", (payload) => {
      console.log("Cambio en amenities_attendees:", payload)
      fetchAllData()
    })

    const rafflesChannel = subscribeToTable("raffles", (payload) => {
      console.log("Cambio en raffles:", payload)
      fetchAllData()
    })

    const raffleWinnerChannel = subscribeToTable("raffle_winner", (payload) => {
      console.log("Cambio en raffle_winner:", payload)
      fetchAllData()
    })

    // Limpiar suscripciones al desmontar
    return () => {
      unsubscribeFromChannel(attendantsChannel)
      unsubscribeFromChannel(amenitiesChannel)
      unsubscribeFromChannel(amenitiesAttendeesChannel)
      unsubscribeFromChannel(rafflesChannel)
      unsubscribeFromChannel(raffleWinnerChannel)
    }
  }, [fetchAllData])

  // Preparar datos para gráficos
  const prepareChartData = () => {
    // Amenidades por asistente
    const amenitiesPerAttendee = attendees
      .map((attendee) => {
        const attendeeAmenities = amenitiesAttendees.filter((item) => item.attendee_id === attendee.id)
        return {
          name: `${attendee.name} ${attendee.second_name || ""}`.substring(0, 15),
          value: attendeeAmenities.length,
          attendeeId: attendee.id,
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 asistentes por amenidades

    // Uso de amenidades
    const amenitiesUsage = amenities.map((amenity) => {
      const usedQuantity = amenitiesAttendees
        .filter((item) => item.amenitie_id === amenity.id)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)

      return {
        name: amenity.name.substring(0, 15), // Truncar nombres largos
        total: amenity.quantity,
        used: usedQuantity,
        remaining: amenity.quantity - usedQuantity,
      }
    })

    // Distribución de amenidades
    const amenitiesDistribution = amenities.map((amenity) => ({
      name: amenity.name.substring(0, 15), // Truncar nombres largos
      value: amenity.quantity,
    }))

    // Ganadores de rifas por rifa
    const raffleWinnersDistribution = raffles.map((raffle) => {
      const winners = raffleWinners.filter((winner) => winner.raffle_id === raffle.id).length

      return {
        name: raffle.name.substring(0, 15), // Truncar nombres largos
        value: winners,
      }
    })

    // Amenidades por sección
    const amenitiesBySection = amenities.reduce((acc, amenity) => {
      const sectionId = amenity.section_id || "Sin sección"
      if (!acc[sectionId]) {
        acc[sectionId] = { name: `Sección ${sectionId}`, value: 0 }
      }
      acc[sectionId].value += 1
      return acc
    }, {})

    // Datos de check-in por hora
    const checkInByHour = checkInStats
      ? Object.entries(checkInStats.checkInsByHour).map(([hour, count]) => ({
        name: hour,
        value: count,
      }))
      : []

    return {
      amenitiesPerAttendee,
      amenitiesUsage,
      amenitiesDistribution,
      raffleWinnersDistribution,
      amenitiesBySection: Object.values(amenitiesBySection),
      checkInByHour,
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando dashboard...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>
  if (!event) return <div className="p-4">Evento no encontrado</div>

  const chartData = prepareChartData()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard en Tiempo Real: {event.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Los datos se actualizan automáticamente cuando hay cambios</p>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Asistentes"
          value={attendees.length}
          icon={<Users className="h-4 w-4" />}
          description="Número de asistentes registrados"
        />
        <StatCard
          title="Total Amenidades"
          value={amenities.length}
          icon={<Package className="h-4 w-4" />}
          description="Diferentes amenidades disponibles"
        />
        <StatCard
          title="Total Rifas"
          value={raffles.length}
          icon={<Gift className="h-4 w-4" />}
          description="Rifas creadas para este evento"
        />
        <StatCard
          title="Check-ins"
          value={checkInStats ? `${checkInStats.checkedIn}/${checkInStats.totalAttendees}` : "0/0"}
          icon={<CheckSquare className="h-4 w-4" />}
          description="Asistentes que han hecho check-in"
        />
      </div>

      {/* Gráficos - Primera Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Distribución de Amenidades">
          <BarChart data={chartData.amenitiesDistribution} />
        </ChartCard>

        <ChartCard title="Ganadores de Rifas">
          <PieChart data={chartData.raffleWinnersDistribution} />
        </ChartCard>
      </div>

      {/* Gráficos - Segunda Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Top Asistentes por Amenidades">
          <BarChart data={chartData.amenitiesPerAttendee} />
        </ChartCard>

        <ChartCard title="Amenidades por Sección">
          <PieChart data={chartData.amenitiesBySection} />
        </ChartCard>
      </div>

      {/* Gráfico de Check-in por Hora */}
      <div className="mb-6">
        <ChartCard title="Check-ins por Hora">
          <LineChart data={chartData.checkInByHour} xKey="name" yKey="value" />
        </ChartCard>
      </div>

      {/* Tablas */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ChartCard title="Uso de Amenidades">
          <AmenityUsageTable amenities={chartData.amenitiesUsage} />
        </ChartCard>

        <ChartCard title="Ganadores de Rifas">
          <RaffleWinnersTable winners={raffleWinners} />
        </ChartCard>
      </div>
    </div>
  )
}
