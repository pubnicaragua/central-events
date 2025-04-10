import type React from "react"
import { Trophy } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RaffleWinsCardProps {
  raffleWins: any[]
  themeConfig?: any
}

const RaffleWinsCard: React.FC<RaffleWinsCardProps> = ({ raffleWins, themeConfig }) => {
  if (!raffleWins || raffleWins.length === 0) return null

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
        <Trophy className="mr-2 h-5 w-5" style={iconStyle} />
        Has ganado una rifa 
      </h2>

      <div className="space-y-4">
        {raffleWins.map((win) => (
          <div
            key={win.id}
            className="flex items-center p-3 border rounded-lg"
            style={{ borderColor: styles.borderColor || defaultStyles.borderColor }}
          >
            <Trophy className="h-5 w-5 mr-3 text-yellow-500" />
            <div className="flex-1">
              <p className="font-medium" style={valueStyle}>
                {win.raffles?.name || "Rifa"}
              </p>
              {win.raffles?.description && (
                <p className="text-sm" style={labelStyle}>
                  {win.raffles.description}
                </p>
              )}
              {win.created_at && (
                <p className="text-xs mt-1" style={labelStyle}>
                  {format(new Date(win.created_at), "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RaffleWinsCard

