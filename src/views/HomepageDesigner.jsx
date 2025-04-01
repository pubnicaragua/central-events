"use client"

import { useState, useEffect, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { HexColorPicker } from "react-colorful"
import { Image, Link2, X, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useParams } from "react-router-dom"
import PropTypes from "prop-types"
import supabase from "../api/supabase"

export default function HomepageDesigner() {
  const { eventId } = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)

  const [design, setDesign] = useState({
    event_id: eventId,
    cover_image: null,
    background_type: "color", // 'color' o 'image'
    use_cover_as_background: false,
    page_background_color: "#E3F2FD",
    content_background_color: "#FFFFFF",
    primary_color: "#E91E63",
    secondary_color: "#00BCD4",
    primary_text_color: "#212121",
    secondary_text_color: "#FFFFFF",
    continue_button_text: "Continúe en",
  })

  // Cargar diseño existente
  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("homepage_design").select("*").eq("event_id", eventId).single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching homepage design:", error)
          return
        }

        if (data) {
          setDesign(data)

          // Si hay una imagen de portada, obtener la URL
          if (data.cover_image) {
            setImageUrl(data.cover_image)
            setImagePreview(data.cover_image)
          }
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchDesign()
    }
  }, [eventId])

  // Manejar carga de imágenes
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setImageFile(file)

      // Crear vista previa
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDesign((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value, field) => {
    setDesign((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Subir imagen al bucket y guardar diseño
  const handleSave = async () => {
    try {
      setIsSaving(true)
      let coverImageUrl = imageUrl

      // Si hay un nuevo archivo de imagen, subirlo al bucket
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${eventId}-cover-${Date.now()}.${fileExt}`
        const filePath = `homepage/${fileName}`

        // Subir archivo al bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("homepage")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        // Obtener URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("homepage").getPublicUrl(filePath)

        coverImageUrl = publicUrl
        setImageUrl(publicUrl)
      }

      // Preparar datos para guardar
      const designData = {
        ...design,
        cover_image: coverImageUrl,
        event_id: eventId,
      }

      // Verificar si ya existe un diseño para este evento
      const { data: existingDesign } = await supabase
        .from("homepage_design")
        .select("id")
        .eq("event_id", eventId)
        .single()

      let saveResult

      if (existingDesign) {
        // Actualizar diseño existente
        saveResult = await supabase.from("homepage_design").update(designData).eq("event_id", eventId)
      } else {
        // Crear nuevo diseño
        saveResult = await supabase.from("homepage_design").insert(designData)
      }

      if (saveResult.error) {
        throw saveResult.error
      }

      toast({
        title: "Diseño guardado",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar el diseño:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Eliminar imagen
  const handleRemoveImage = (e) => {
    e.stopPropagation()
    setImageFile(null)
    setImagePreview(null)

    // Si estamos usando la imagen como fondo, cambiar a color
    if (design.background_type === "image") {
      setDesign((prev) => ({
        ...prev,
        background_type: "color",
        cover_image: null,
      }))
    } else {
      setDesign((prev) => ({
        ...prev,
        cover_image: null,
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Portada"
                    className="h-32 w-full rounded object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveImage}
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
              <div className="space-y-2">
                <Label>Tipo de fondo</Label>
                <Select
                  value={design.background_type}
                  onValueChange={(value) => handleSelectChange(value, "background_type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un tipo de fondo" />
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
                value={design.page_background_color}
                onChange={(color) => handleColorChange(color, "page_background_color")}
              />

              <ColorPicker
                label="Color de fondo del contenido"
                value={design.content_background_color}
                onChange={(color) => handleColorChange(color, "content_background_color")}
              />

              <ColorPicker
                label="Color primario"
                value={design.primary_color}
                onChange={(color) => handleColorChange(color, "primary_color")}
              />

              <ColorPicker
                label="Color secundario"
                value={design.secondary_color}
                onChange={(color) => handleColorChange(color, "secondary_color")}
              />

              <ColorPicker
                label="Color de texto principal"
                value={design.primary_text_color}
                onChange={(color) => handleColorChange(color, "primary_text_color")}
              />

              <ColorPicker
                label="Color de texto secundario"
                value={design.secondary_text_color}
                onChange={(color) => handleColorChange(color, "secondary_text_color")}
              />

              <div className="space-y-2">
                <Label>Texto del botón Continuar</Label>
                <Input name="continue_button_text" value={design.continue_button_text} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* Vista previa */}
      <div className="flex-1">
        <div
          className="flex min-h-full items-center justify-center rounded-lg p-8"
          style={{
            backgroundColor: design.background_type === "color" ? design.page_background_color : "transparent",
            backgroundImage: design.background_type === "image" && imagePreview ? `url(${imagePreview})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Contenedor de contenido */}
          <div
            className="w-full max-w-md rounded-lg p-6 shadow-lg"
            style={{ backgroundColor: design.content_background_color }}
          >
            <h2 className="mb-4 text-2xl font-bold" style={{ color: design.primary_text_color }}>
              Vista previa del diseño
            </h2>

            <p className="mb-6" style={{ color: design.primary_text_color }}>
              Así se verá tu página de inicio con los colores y diseño seleccionados.
            </p>

            <div className="flex justify-between">
              <Button
                style={{
                  backgroundColor: design.secondary_color,
                  color: design.secondary_text_color,
                }}
              >
                Botón secundario
              </Button>

              <Button
                style={{
                  backgroundColor: design.primary_color,
                  color: design.secondary_text_color,
                }}
              >
                {design.continue_button_text}
              </Button>
            </div>
          </div>
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
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <div className="mr-2 h-4 w-4 rounded" style={{ backgroundColor: value }} />
            {value}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={value} onChange={onChange} />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2" />
        </PopoverContent>
      </Popover>
    </div>
  )
}

HomepageDesigner.propTypes = {
  eventId: PropTypes.string,
  initialDesign: PropTypes.object,
}

ColorPicker.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

