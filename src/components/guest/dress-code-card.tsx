import type React from "react"
import { Shirt, Scissors, ShoppingBag, Footprints, StickyNote } from "lucide-react"

interface DressCodeCardProps {
  dressCode: any
  themeConfig?: any
}

const DressCodeCard: React.FC<DressCodeCardProps> = ({ dressCode, themeConfig }) => {
  if (!dressCode) return null

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
      <h2 className="text-xl font-semibold flex items-center mb-4" style={titleStyle}>
        <Shirt className="mr-2 h-5 w-5" style={iconStyle} />
        Código de Vestimenta
      </h2>

      <div className="space-y-4">
        {dressCode.name && (
          <div>
            <p className="text-sm mb-1" style={labelStyle}>
              Tipo
            </p>
            <p className="font-medium" style={valueStyle}>
              {dressCode.name}
            </p>
          </div>
        )}

        {dressCode.description && (
          <div>
            <p className="text-sm mb-1" style={labelStyle}>
              Descripción
            </p>
            <p className="text-sm" style={valueStyle}>
              {dressCode.description}
            </p>
          </div>
        )}

        {dressCode.allowed_accessories && (
          <div>
            <p className="text-sm mb-1 flex items-center" style={labelStyle}>
              <ShoppingBag className="mr-1 h-4 w-4" style={iconStyle} />
              Accesorios Permitidos
            </p>
            <p className="text-sm" style={valueStyle}>
              {dressCode.allowed_accessories}
            </p>
          </div>
        )}

        {dressCode.restricted_accessories && (
          <div>
            <p className="text-sm mb-1 flex items-center" style={labelStyle}>
              <Scissors className="mr-1 h-4 w-4" style={iconStyle} />
              Accesorios Restringidos
            </p>
            <p className="text-sm" style={valueStyle}>
              {dressCode.restricted_accessories}
            </p>
          </div>
        )}

        {dressCode.footwear && (
          <div>
            <p className="text-sm mb-1 flex items-center" style={labelStyle}>
              <Footprints className="mr-1 h-4 w-4" style={iconStyle} />
              Calzado
            </p>
            <p className="text-sm" style={valueStyle}>
              {dressCode.footwear}
            </p>
          </div>
        )}

        {dressCode.notes && (
          <div>
            <p className="text-sm mb-1 flex items-center" style={labelStyle}>
              <StickyNote className="mr-1 h-4 w-4" style={iconStyle} />
              Notas Adicionales
            </p>
            <p className="text-sm" style={valueStyle}>
              {dressCode.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DressCodeCard

