"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, MapPin, Info, CalendarPlus, ExternalLink } from "lucide-react"

interface EventInfoCardProps {
  event: any
  location: any
  handleAddToCalendar: (event: any) => void
  themeConfig?: any
}

const EventInfoCard: React.FC<EventInfoCardProps> = ({ event, location, handleAddToCalendar, themeConfig }) => {
  const [showMapModal, setShowMapModal] = useState(false)

  if (!event) return null

  // Estilos por defecto
  const defaultStyles = {
    cardBg: "#ffffff",
    primaryText: "#333333",
    secondaryText: "#666666",
    accentColor: "#4a148c",
    borderColor: "#e0e0e0",
    iconColor: "#666666",
  }

  // Usar estilos personalizados si están disponibles
  const styles = themeConfig || defaultStyles

  // Estilos para el componente
  const cardStyle = {
    backgroundColor: styles.cardBg || defaultStyles.cardBg,
    borderColor: styles.borderColor || defaultStyles.borderColor,
  }

  const titleStyle = {
    color: styles.primaryText || defaultStyles.primaryText,
  }

  const labelStyle = {
    color: styles.secondaryText || defaultStyles.secondaryText,
  }

  const valueStyle = {
    color: styles.primaryText || defaultStyles.primaryText,
  }

  const iconStyle = {
    color: styles.iconColor || defaultStyles.iconColor,
  }

  const buttonStyle = {
    backgroundColor: styles.accentColor || defaultStyles.accentColor,
  }

  const openGoogleMaps = () => {
    if (!location) return

    let query = ""

    if (location.map_url) {
      // Si hay una URL de mapa específica, usarla directamente
      window.open(location.map_url, "_blank")
      return
    }

    // Si no hay URL específica, construir una consulta con la dirección
    if (location.address) {
      query = location.address
      if (location.city) query += `, ${location.city}`
      if (location.state) query += `, ${location.state}`
      if (location.postal_code) query += ` ${location.postal_code}`
      if (location.country_name) query += `, ${location.country_name}`
    } else if (location.lat && location.long) {
      // Si hay coordenadas, usarlas
      query = `${location.lat},${location.long}`
    }

    if (query) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      window.open(url, "_blank")
    }
  }

  const formatLocation = () => {
    if (!location) return "No especificada"

    let formattedLocation = ""

    if (location.address) {
      formattedLocation = location.address
      if (location.city) formattedLocation += `, ${location.city}`
      if (location.state) formattedLocation += `, ${location.state}`
    } else if (location.city) {
      formattedLocation = location.city
      if (location.state) formattedLocation += `, ${location.state}`
    } else if (location.is_online) {
      formattedLocation = "Evento en línea"
    }

    return formattedLocation || "No especificada"
  }

  return (
    <div className="rounded-lg shadow-md p-6 mb-6 border" style={cardStyle}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center" style={titleStyle}>
          <Calendar className="mr-2 h-5 w-5" style={iconStyle} />
          Información del Evento
        </h2>
        <button
          onClick={() => handleAddToCalendar(event)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={buttonStyle}
        >
          <CalendarPlus className="mr-1 h-4 w-4" />
          Añadir a Calendario
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm mb-1" style={labelStyle}>
            Nombre
          </p>
          <p className="font-medium" style={valueStyle}>
            {event.name}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1" style={labelStyle}>
            Fecha
          </p>
          <p className="font-medium flex items-center" style={valueStyle}>
            <Calendar className="mr-1 h-4 w-4" style={iconStyle} />
            {event.start_date && format(new Date(event.start_date), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1" style={labelStyle}>
            Hora
          </p>
          <p className="font-medium flex items-center" style={valueStyle}>
            <Clock className="mr-1 h-4 w-4" style={iconStyle} />
            {event.start_date && format(new Date(event.start_date), "h:mm a", { locale: es })}
          </p>
        </div>
        <div>
          <div className="flex">
            <MapPin className="mr-1 h-4 w-4" style={iconStyle} />
            <p className="text-sm mb-1" style={labelStyle}>
              Ubicación
            </p>
          </div>
          <p className="font-medium flex items-center" style={valueStyle}>
            {formatLocation()}
          </p>
          <div className="flex flex-col justify-between">
            {location && (location.address || location.lat) && (
              <button
                onClick={openGoogleMaps}
                className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={buttonStyle}
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Ver Mapa
              </button>
            )}
          </div>
        </div>
        {event.description && (
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm mb-1 flex items-center" style={labelStyle}>
              <Info className="mr-1 h-4 w-4" style={iconStyle} />
              Descripción
            </p>
            <p className="text-sm" style={valueStyle}>
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventInfoCard

