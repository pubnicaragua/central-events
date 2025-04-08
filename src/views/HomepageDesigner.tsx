"use client"

import type React from "react"

// Importar las funciones necesarias de Supabase
import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import {
  ChevronLeft,
  Map,
  Download,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Package,
  Shirt,
  QrCode,
  User,
  Save,
  Loader2,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ColorPicker } from "@/components/color-picker"
import { QRCode } from "@/components/qr-code"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { saveThemeConfig, getThemeConfigByEventId, type ThemeConfig } from "@/components/lib/supabase"

export default function Home() {
  const [theme, setTheme] = useState({
    id: undefined,
    name: "Configuración actual",
    event_id: undefined,
    headerBg: "#2D1B3D",
    pageBg: "#ffffff",
    cardBg: "#ffffff",
    primaryText: "#000000",
    secondaryText: "#666666",
    accentColor: "#10B981",
    borderColor: "#e5e7eb",
    iconColor: "#000000",
    headerImage: "/placeholder.svg?height=300&width=1000",
    qrModuleColor: "#000000",
    qrBackgroundColor: "#ffffff",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Obtener el ID del evento de los parámetros de la URL
  const params = useParams()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const eventId = params.eventId || searchParams.get("eventId")

  // Cargar la configuración del tema al iniciar
  useEffect(() => {
    async function loadThemeConfig() {
      if (!eventId) {
        setIsLoading(false)
        return
      }

      try {
        const config = await getThemeConfigByEventId(eventId)
        if (config) {
          setTheme({
            id: config.id,
            name: config.name || "Configuración actual",
            event_id: config.event_id,
            headerBg: config.headerBg,
            pageBg: config.pageBg,
            cardBg: config.cardBg,
            primaryText: config.primaryText,
            secondaryText: config.secondaryText,
            accentColor: config.accentColor,
            borderColor: config.borderColor,
            iconColor: config.iconColor,
            headerImage: config.headerImageUrl || "/placeholder.svg?height=300&width=1000",
            qrModuleColor: config.qrModuleColor,
            qrBackgroundColor: config.qrBackgroundColor,
          })
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración guardada",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadThemeConfig()
  }, [eventId])

  const handleColorChange = (key: string, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setTheme((prev) => ({ ...prev, headerImage: imageUrl }))
    }
  }

  // Función para guardar la configuración actual
  const handleSaveConfig = async () => {
    try {
      setIsSaving(true)

      // Preparar el objeto de configuración para guardar
      const configToSave: ThemeConfig = {
        id: theme.id,
        name: theme.name,
        event_id: eventId,
        headerBg: theme.headerBg,
        pageBg: theme.pageBg,
        cardBg: theme.cardBg,
        primaryText: theme.primaryText,
        secondaryText: theme.secondaryText,
        accentColor: theme.accentColor,
        borderColor: theme.borderColor,
        iconColor: theme.iconColor,
        headerImageUrl: theme.headerImage,
        qrModuleColor: theme.qrModuleColor,
        qrBackgroundColor: theme.qrBackgroundColor,
      }

      const savedConfig = await saveThemeConfig(configToSave)

      // Actualizar el ID en el estado si es una nueva configuración
      if (savedConfig && !theme.id) {
        setTheme((prev) => ({ ...prev, id: savedConfig.id }))
      }

      toast({
        title: "Configuración guardada",
        description: "Los colores y la imagen se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.pageBg }}>
      <div className="container mx-auto p-4">
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-0">
            <EventPreview theme={theme} />
          </TabsContent>

          <TabsContent value="config">
            <div className="grid gap-6 p-6 border rounded-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Panel de Configuración</h2>
                <Button onClick={handleSaveConfig} disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Guardar Configuración</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Colores Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorOption
                    label="Color de Fondo de Página"
                    value={theme.pageBg}
                    onChange={(value) => handleColorChange("pageBg", value)}
                  />
                  <ColorOption
                    label="Color de Fondo de Tarjetas"
                    value={theme.cardBg}
                    onChange={(value) => handleColorChange("cardBg", value)}
                  />
                  <ColorOption
                    label="Color de Texto Principal"
                    value={theme.primaryText}
                    onChange={(value) => handleColorChange("primaryText", value)}
                  />
                  <ColorOption
                    label="Color de Texto Secundario"
                    value={theme.secondaryText}
                    onChange={(value) => handleColorChange("secondaryText", value)}
                  />
                  <ColorOption
                    label="Color de Acento"
                    value={theme.accentColor}
                    onChange={(value) => handleColorChange("accentColor", value)}
                  />
                  <ColorOption
                    label="Color de Bordes"
                    value={theme.borderColor}
                    onChange={(value) => handleColorChange("borderColor", value)}
                  />
                  <ColorOption
                    label="Color de Iconos"
                    value={theme.iconColor}
                    onChange={(value) => handleColorChange("iconColor", value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Cabecera</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorOption
                    label="Color de Fondo de Cabecera"
                    value={theme.headerBg}
                    onChange={(value) => handleColorChange("headerBg", value)}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagen de Cabecera</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary/90"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Código QR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorOption
                    label="Color de Módulos QR"
                    value={theme.qrModuleColor}
                    onChange={(value) => handleColorChange("qrModuleColor", value)}
                  />
                  <ColorOption
                    label="Color de Fondo QR"
                    value={theme.qrBackgroundColor}
                    onChange={(value) => handleColorChange("qrBackgroundColor", value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

interface ColorOptionProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorOption({ label, value, onChange }: ColorOptionProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <ColorPicker value={value} onChange={onChange} />
        <span className="text-xs font-mono">{value}</span>
      </div>
    </div>
  )
}

// Actualizar la interfaz EventPreviewProps para incluir los nuevos colores del QR
interface EventPreviewProps {
  theme: {
    headerBg: string
    pageBg: string
    cardBg: string
    primaryText: string
    secondaryText: string
    accentColor: string
    borderColor: string
    iconColor: string
    headerImage: string
    qrModuleColor: string
    qrBackgroundColor: string
  }
}

function EventPreview({ theme }: EventPreviewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="relative rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${theme.headerImage})`,
            backgroundColor: theme.headerBg,
          }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: `${theme.headerBg}90` }} />

        <div className="relative p-8">
          <a href="#" className="inline-flex items-center gap-1 text-white mb-6">
            <ChevronLeft size={16} />
            <span>Volver</span>
          </a>

          <div className="mt-16 text-white">
            <h1 className="text-3xl font-bold mb-2">Conferencia 2025</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>16 de abril, 2025</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>5 asistentes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Información del Asistente */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            borderWidth: "1px",
            color: theme.primaryText,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <User size={20} style={{ color: theme.iconColor }} />
            <h2 className="text-lg font-semibold">Información del Asistente</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Nombre
              </p>
              <p className="font-medium">Benjamín Galán</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Email
              </p>
              <p className="font-medium">begalan@outlook.es</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Código
              </p>
              <p className="font-medium">1FFHFQ</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Tipo de Entrada
              </p>
              <p className="font-medium">No especificado</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Estado
              </p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }}></span>
                <p className="font-medium">Pendiente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Evento */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            borderWidth: "1px",
            color: theme.primaryText,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} style={{ color: theme.iconColor }} />
            <h2 className="text-lg font-semibold">Información del Evento</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Nombre
              </p>
              <p className="font-medium">Conferencia 2025</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Fecha
              </p>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: theme.iconColor }} />
                <p className="font-medium">16 de abril, 2025</p>
              </div>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Hora
              </p>
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: theme.iconColor }} />
                <p className="font-medium">8:00 AM</p>
              </div>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Ubicación
              </p>
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: theme.iconColor }} />
                <p className="font-medium">Bloquera Howard, 1 cuadra al este, 1 cuadra al norte., Managua, Managua</p>
              </div>
            </div>

            <Button
              className="flex items-center justify-center gap-2 w-full"
              style={{
                backgroundColor: theme.accentColor,
                color: "#ffffff",
              }}
            >
              <Map size={16} />
              <span>Ver Mapa</span>
            </Button>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Descripción
              </p>
              <p className="font-medium">Conferencia 2025</p>
            </div>
          </div>
        </div>

        {/* Amenidades Asignadas */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            borderWidth: "1px",
            color: theme.primaryText,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} style={{ color: theme.iconColor }} />
            <h2 className="text-lg font-semibold">Amenidades Asignadas</h2>
          </div>

          <p className="mb-4">Sin sección</p>

          <div className="grid gap-2">
            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center gap-2">
                <Package size={16} style={{ color: theme.iconColor }} />
                <span>2 disponibles</span>
              </div>
              <Check size={16} style={{ color: theme.accentColor }} />
            </div>

            <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center gap-2">
                <Package size={16} style={{ color: theme.iconColor }} />
                <span>1 disponible</span>
              </div>
              <Check size={16} style={{ color: theme.accentColor }} />
            </div>

            <div className="flex items-center justify-between p-3" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center gap-2">
                <Package size={16} style={{ color: theme.iconColor }} />
                <span>3 disponibles</span>
              </div>
              <Check size={16} style={{ color: theme.accentColor }} />
            </div>
          </div>
        </div>

        {/* Rifas Ganadas */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            borderWidth: "1px",
            color: theme.primaryText,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} style={{ color: theme.iconColor }} />
            <h2 className="text-lg font-semibold">Rifas Ganadas</h2>
          </div>

          <div className="flex items-center gap-2 p-4 border rounded-lg" style={{ borderColor: theme.borderColor }}>
            <Trophy size={16} style={{ color: theme.accentColor }} />
            <span>2 de abril, 2025 a las 5:08 PM</span>
          </div>
        </div>

        {/* Código de Vestimenta */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            borderWidth: "1px",
            color: theme.primaryText,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shirt size={20} style={{ color: theme.iconColor }} />
            <h2 className="text-lg font-semibold">Código de Vestimenta</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Tipo
              </p>
              <p className="font-medium">Casual actualizado</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Descripción
              </p>
              <p className="font-medium">Combinación de comodidad y estilo moderno.</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Accesorios Permitidos
              </p>
              <p className="font-medium">Gafas de sol (si es de día), carteras medianas, pañuelos.</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Accesorios Restringidos
              </p>
              <p className="font-medium">Sandalias playeras, gorras deportivas</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Calzado
              </p>
              <p className="font-medium">Zapatillas limpias de diseño, botines, loafers.</p>
            </div>

            <div>
              <p className="text-sm" style={{ color: theme.secondaryText }}>
                Notas Adicionales
              </p>
              <p className="font-medium">Se valora el estilo personal sin caer en lo informal.</p>
            </div>
          </div>
        </div>

        {/* Código QR */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            borderWidth: "1px",
            color: theme.primaryText,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={20} style={{ color: theme.iconColor }} />
            <h2 className="text-lg font-semibold">Código QR</h2>
          </div>

          <div className="flex flex-col items-center gap-4">
            <QRCode
              moduleColor={theme.qrModuleColor}
              backgroundColor={theme.qrBackgroundColor}
              size={200}
              className="border"
              style={{ borderColor: theme.borderColor }}
            />

            <Button
              className="flex items-center justify-center gap-2 w-full"
              style={{
                backgroundColor: theme.accentColor,
                color: "#ffffff",
              }}
            >
              <Download size={16} />
              <span>Descargar QR</span>
            </Button>

            <p className="text-sm text-center" style={{ color: theme.secondaryText }}>
              Este código QR contiene la información necesaria para obtener la información del asistente.
            </p>

            <p className="text-xs text-center mt-2 italic" style={{ color: theme.secondaryText }}>
              ⚠️ Para garantizar que el código QR sea escaneable, asegurate de usar un color <strong>oscuro para el código</strong> y
              un <strong>color claro para el fondo</strong>, de preferencia <strong>negro sobre blanco</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

