"use client"

import type React from "react"
import { useRef } from "react"
import QRCode from "react-qr-code"
import { QrCode, Download, Info } from "lucide-react"
import html2canvas from "html2canvas"

interface QRCodeCardProps {
  attendee: any
  eventId: string | number
  themeConfig?: any
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({ attendee, eventId, themeConfig }) => {
  const qrRef = useRef(null)

  const handleDownloadQR = async () => {
    if (!qrRef.current) return

    try {
      const canvas = await html2canvas(qrRef.current)
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `qr-code-${attendee.name}-${attendee.code}.png`
      link.click()
    } catch (error) {
      console.error("Error al descargar el código QR:", error)
    }
  }

  if (!attendee) return null

  // Estilos por defecto
  const defaultStyles = {
    cardBg: "#ffffff",
    primaryText: "#333333",
    secondaryText: "#666666",
    accentColor: "#4a148c",
    borderColor: "#e0e0e0",
    iconColor: "#666666",
    qrModuleColor: "#000000",
    qrBackgroundColor: "#ffffff",
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

  const iconStyle = {
    color: styles.iconColor || defaultStyles.iconColor,
  }

  const buttonStyle = {
    backgroundColor: styles.accentColor || defaultStyles.accentColor,
  }

  const qrValue = JSON.stringify({
    attendeeId: attendee.id,     // ← importante: mantener camelCase
    eventId: eventId,
    name: attendee.name,
    code: attendee.code,
  })
  

  return (
    <div className="rounded-lg shadow-md p-6 border" style={cardStyle}>
      <h2 className="text-xl font-semibold mb-4 flex items-center" style={titleStyle}>
        <QrCode className="mr-2 h-5 w-5" style={iconStyle} />
        Código QR
      </h2>
      <div className="flex flex-col items-center">
        <div
          ref={qrRef}
          className="p-4 rounded-lg border-2 mb-4"
          style={{
            backgroundColor: styles.qrBackgroundColor || defaultStyles.qrBackgroundColor,
            borderColor: styles.borderColor || defaultStyles.borderColor,
          }}
        >
          <QRCode
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
            renderAs="canvas"
            fgColor={styles.qrModuleColor || defaultStyles.qrModuleColor}
            bgColor={styles.qrBackgroundColor || defaultStyles.qrBackgroundColor}
          />
        </div>
        <button
          onClick={handleDownloadQR}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 mb-4"
          style={buttonStyle}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar QR
        </button>
        <div
          className="text-sm p-3 rounded-lg flex items-start"
          style={{
            backgroundColor: styles.pageBg || "#f5f5f5",
            color: styles.secondaryText || defaultStyles.secondaryText,
          }}
        >
          <Info
            className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
            style={{ color: styles.accentColor || defaultStyles.accentColor }}
          />
          <p>
            Este código QR contiene la información necesaria para el check-in del asistente. Puede ser escaneado en la
            entrada del evento para registrar la asistencia.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QRCodeCard

