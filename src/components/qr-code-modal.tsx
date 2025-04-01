"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Download } from "lucide-react"

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  attendee: any
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, attendee }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && attendee) {
      generateQrCode()
    }
  }, [isOpen, attendee])

  const generateQrCode = async () => {
    try {
      setIsLoading(true)

      // Crear datos para el QR
      const attendeeData = {
        id: attendee.id,
        name: `${attendee.name} ${attendee.second_name || ""}`.trim(),
        code: attendee.code,
        email: attendee.email,
        status: attendee.status,
      }

      // Convertir a JSON y codificar para URL
      const dataString = encodeURIComponent(JSON.stringify(attendeeData))

      // Usar la API de QR Code Generator
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${dataString}`
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error("Error al generar el código QR:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    // Crear un enlace temporal para descargar la imagen
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `qr-${attendee.code || attendee.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Código QR - {attendee?.name} {attendee?.second_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          {isLoading ? (
            <div className="text-center py-8">Generando código QR...</div>
          ) : (
            <>
              <div className="border p-4 rounded-md bg-white">
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="Código QR"
                  className="w-48 h-48"
                  onLoad={() => setIsLoading(false)}
                />
              </div>

              <div className="mt-4 text-center">
                <p className="font-medium">
                  {attendee?.name} {attendee?.second_name}
                </p>
                <p className="text-sm text-gray-500">Código: {attendee?.code}</p>
                {attendee?.email && <p className="text-sm text-gray-500">{attendee.email}</p>}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleDownload} disabled={isLoading} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default QrCodeModal

