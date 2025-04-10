import type React from "react"
import { Coffee, Package, CheckCircle, XCircle } from "lucide-react"

interface AmenitiesCardProps {
  amenities: any[]
  amenitySections: any[]
  themeConfig?: any
}

const AmenitiesCard: React.FC<AmenitiesCardProps> = ({ amenities, amenitySections, themeConfig }) => {
  if (!amenities || amenities.length === 0) return null

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
        <Coffee className="mr-2 h-5 w-5" style={iconStyle} />
        Amenidades Asignadas
      </h2>

      {amenities.map((section) => (
  <div key={section.id} className="mb-6 last:mb-0">
    <h3 className="text-lg font-medium mb-3" style={titleStyle}>
      {section.name}
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {section.items?.map((amenity) => (
        <div
          key={amenity.id}
          className="flex items-center p-3 border rounded-lg"
          style={{ borderColor: styles.borderColor || defaultStyles.borderColor }}
        >
          <Package className="h-5 w-5 mr-3" style={iconStyle} />
          <div className="flex-1">
            <p className="font-medium" style={valueStyle}>
              {amenity.name}
            </p>
            <p className="text-sm" style={labelStyle}>
              {amenity.quantity > 0
                ? `${amenity.quantity} disponible${amenity.quantity !== 1 ? "s" : ""}`
                : "Agotado"}
            </p>
          </div>
          {amenity.quantity > 0 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      ))}
    </div>
  </div>
))}

    </div>
  )

}

export default AmenitiesCard

