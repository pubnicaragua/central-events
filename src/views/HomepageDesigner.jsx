"use client"

import { useState, useEffect, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { HexColorPicker } from "react-colorful"
import { Image, Link2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { updateHomepageDesign } from "@actions/homepage-design"
import supabase from "../api/supabase"
import { useParams } from "react-router-dom"
import PropTypes from 'prop-types'


export default function HomepageDesigner({ eventId, initialDesign }) {
  const { eventId: paramEventId } = useParams()
  const [data, setData] = useState([])

  const [design, setDesign] = useState(
    initialDesign || {
      bg_type: "color",
      page_background_color: "#7a5eb9",
      content_background_color: "#ffffff",
      primary_color: "#7b5db8",
      secondary_color: "#7b5eb9",
      primary_text_color: "#000000",
      secondary_text_color: "#ffffff",
      continue_button_text: "Continúe en",
      cover_image: null,
    },
  )

  useEffect(() => {
    const fetchDesing = async () => {
      const { data, error } = await supabase
        .from("homepage_conf")
        .select("*")
        .eq("event_id", paramEventId)

      console.log(`El evento ${paramEventId} tiene la siguiente configuración:`, data)

      if (error) {
        console.error("Error fetching homepage_conf:", error)
      } else {
        setData(data)
      }
    }

    fetchDesing();
  }, [paramEventId])


  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setDesign((prev) => ({
          ...prev,
          cover_image: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
  })

  const handleColorChange = (color, field) => {
    setDesign((prev) => ({
      ...prev,
      [field]: color,
    }))
  }

  const handleSave = async () => {
    try {
      await updateHomepageDesign(eventId, design)
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error("Error al guardar el diseño:", error)
      // Mostrar mensaje de error
    }
  }

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Panel de configuración */}
      <div className="w-96 space-y-6 overflow-y-auto rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Diseño de página de inicio</h2>

          {/* Sección de portada */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Cubrir</h3>
            <div
              {...getRootProps()}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-muted"
                }`}
            >
              <input {...getInputProps()} />
              {design.cover_image ? (
                <div className="relative w-full">
                  <img
                    src={design.cover_image || "/placeholder.svg"}
                    alt="Portada"
                    className="h-32 w-full rounded object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDesign((prev) => ({ ...prev, cover_image: null }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Image className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Arrastra y suelta o haz clic</p>
                </>
              )}
            </div>
          </div>

          {/* Sección de colores */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Colores</h3>

            <div className="space-y-4">
              {data.map((item) => (
                <div key={item.id} >
                  <div className="space-y-2">
                    <Label>Tipo de fondo</Label>
                    <Select
                      value={item.bg_type ? 'image' : 'color'}
                      onValueChange={(value) => setDesign((prev) => ({ ...prev, background_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Elige un color para tu fondo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">
                          <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            <span>Color</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            <span>Usar imagen de portada</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <ColorPicker
                    label="Color de fondo de la página"
                    value={item.page_bg_color}
                    onChange={(color) => handleColorChange(color, "page_background_color")}
                  />

                  <ColorPicker
                    label="Color de fondo del contenido"
                    value={item.cont_bg_color}
                    onChange={(color) => handleColorChange(color, "content_background_color")}
                  />

                  <ColorPicker
                    label="Color primario"
                    value={item.primary_color}
                    onChange={(color) => handleColorChange(color, "primary_color")}
                  />

                  <ColorPicker
                    label="Color secundario"
                    value={item.secondary_color}
                    onChange={(color) => handleColorChange(color, "secondary_color")}
                  />

                  <ColorPicker
                    label="Color de texto principal"
                    value={item.primary_text_color}
                    onChange={(color) => handleColorChange(color, "primary_text_color")}
                  />

                  <ColorPicker
                    label="Color de texto secundario"
                    value={item.secondary_text_color}
                    onChange={(color) => handleColorChange(color, "secondary_text_color")}
                  />

                  <div className="space-y-2">
                    <Label>Texto del botón Continuar</Label>
                    <Input
                      value={item.next_btn_text}
                      onChange={(e) =>
                        setDesign((prev) => ({
                          ...prev,
                          continue_button_text: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Guardar cambios
        </Button>
      </div>

      {/* Vista previa */}
      <div className="flex-1">
        <div
          className="min-h-full rounded-lg"
          style={{
            backgroundColor: design.background_type === "color" ? design.page_background_color : "transparent",
            backgroundImage:
              design.background_type === "image" && design.cover_image ? `url(${design.cover_image})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Aquí iría la vista previa del diseño */}
        </div>
      </div>
    </div>
  )
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start" style={{ backgroundColor: value }}>
            <div className="mr-2 h-4 w-4 rounded" style={{ backgroundColor: value }} />
            {value}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

HomepageDesigner.propTypes = {
  eventId: PropTypes.string, // o PropTypes.number si es un ID numérico
  initialDesign: PropTypes.string
}

ColorPicker.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
