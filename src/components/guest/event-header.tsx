import type React from "react"
import { Calendar, Users } from "lucide-react"

interface EventHeaderProps {
  event: any
  attendeesCount: number
  homeConfig?: any
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, attendeesCount, homeConfig }) => {
  // Estilos por defecto si no hay configuración personalizada
  const defaultStyles = {
    headerBg: "#4a148c", // Púrpura oscuro por defecto
    primaryText: "#ffffff", // Texto blanco por defecto
    secondaryText: "#e0e0e0", // Texto gris claro por defecto
  }

  // Usar estilos personalizados si están disponibles, o los predeterminados si no
  const styles = homeConfig || defaultStyles

  // Estilo para el fondo del encabezado (imagen o color)
  const headerStyle = {
    backgroundColor: styles.headerBg || defaultStyles.headerBg,
    backgroundImage: styles.headerImageUrl ? `url(${styles.headerImageUrl})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: styles.primaryText || defaultStyles.primaryText,
  }

  return (
    <div className="rounded-lg overflow-hidden mb-6 shadow-lg" style={headerStyle}>
      <div className="bg-black bg-opacity-40 p-6 md:p-10">
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: styles.primaryText || defaultStyles.primaryText }}
        >
          {event.name}
        </h1>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" style={{ color: styles.secondaryText || defaultStyles.secondaryText }} />
            <span style={{ color: styles.secondaryText || defaultStyles.secondaryText }}>
              {event.start_date &&
                new Date(event.start_date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </span>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" style={{ color: styles.secondaryText || defaultStyles.secondaryText }} />
            <span style={{ color: styles.secondaryText || defaultStyles.secondaryText }}>
              {attendeesCount} {attendeesCount === 1 ? "asistente" : "asistentes"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventHeader

