import type React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { User, Clock, CheckCircle, XCircle } from "lucide-react"

interface AttendeeInfoCardProps {
  attendee: any
  themeConfig?: any
}

const AttendeeInfoCard: React.FC<AttendeeInfoCardProps> = ({ attendee, themeConfig }) => {
  if (!attendee) return null

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

  return (
    <div className="rounded-lg shadow-md p-6 mb-6 border" style={cardStyle}>
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={titleStyle}>
        <User className="mr-2 h-5 w-5" style={iconStyle} />
        Información del Asistente
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm mb-1" style={labelStyle}>
            Nombre
          </p>
          <p className="font-medium" style={valueStyle}>
            {attendee.name} {attendee.second_name || ""}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1" style={labelStyle}>
            Email
          </p>
          <p className="font-medium" style={valueStyle}>
            {attendee.email}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1" style={labelStyle}>
            Código
          </p>
          <p className="font-medium" style={valueStyle}>
            {attendee.code}
          </p>
        </div>
        <div>
          <p className="text-sm mb-1" style={labelStyle}>
            Tipo de Entrada
          </p>
          <p className="font-medium" style={valueStyle}>
            {attendee.ticket_name || "No especificado"}
          </p>
        </div>
        <div className="col-span-1 md:col-span-2">
          <p className="text-sm mb-1" style={labelStyle}>
            Estado
          </p>
          <div className="flex items-center">
            {attendee.checked_in ? (
              <>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Registrado
                </span>
                {attendee.checked_in_at && (
                  <span className="text-sm flex items-center" style={labelStyle}>
                    <Clock className="mr-1 h-3 w-3" />
                    {format(new Date(attendee.checked_in_at), "d 'de' MMMM 'a las' h:mm a", { locale: es })}
                  </span>
                )}
              </>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <XCircle className="mr-1 h-3 w-3" />
                Pendiente
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendeeInfoCard

