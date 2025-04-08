"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Progress } from "../../components/ui/progress"
import { Upload, AlertCircle, Check, FileSpreadsheet, X } from "lucide-react"
import * as XLSX from "xlsx"
import supabase from "../../api/supabase"

interface ImportarAsistentesModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  eventId: string
  tickets: any[]
}

interface AsistenteData {
  nombre: string
  apellido: string
  email: string
}

const ImportarAsistentesModal: React.FC<ImportarAsistentesModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  eventId,
  tickets,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<AsistenteData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generar código aleatorio alfanumérico de 6 caracteres
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Manejar la selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setSuccess(null)

    // Leer el archivo Excel
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Mapear los datos a nuestro formato
        const asistentes = jsonData.map((row: any) => {
          // Intentar diferentes nombres de columnas (español e inglés)
          const nombre = row.nombre || row.name || row.Nombre || row.Name || ""
          const apellido =
            row.apellido || row.lastname || row.Apellido || row.Lastname || row.second_name || row.SecondName || ""
          const email = row.email || row.correo || row.Email || row.Correo || ""

          return { nombre, apellido, email }
        })

        // Mostrar vista previa (primeros 5 registros)
        setPreviewData(asistentes.slice(0, 5))

        // Si hay datos, avanzar al paso 2
        if (asistentes.length > 0) {
          setStep(2)
        } else {
          setError("El archivo no contiene datos válidos")
        }
      } catch (error) {
        console.error("Error al leer el archivo:", error)
        setError("Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.")
      }
    }

    reader.onerror = () => {
      setError("Error al leer el archivo")
    }

    reader.readAsBinaryString(selectedFile)
  }

  // Procesar y subir los datos
  const handleUpload = async () => {
    if (!file || !selectedTicket) {
      setError("Debes seleccionar un archivo y un ticket")
      return
    }

    setIsUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(null)

    try {
      // Leer el archivo Excel
      const reader = new FileReader()

      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // Mapear los datos a nuestro formato
          const asistentes = jsonData.map((row: any) => {
            // Intentar diferentes nombres de columnas (español e inglés)
            const nombre = row.nombre || row.name || row.Nombre || row.Name || ""
            const apellido =
              row.apellido || row.lastname || row.Apellido || row.Lastname || row.second_name || row.SecondName || ""
            const email = row.email || row.correo || row.Email || row.Correo || ""

            return { nombre, apellido, email }
          })

          // Filtrar registros inválidos (sin nombre)
          const validAsistentes = asistentes.filter((a) => a.nombre.trim() !== "")

          if (validAsistentes.length === 0) {
            setError("No hay datos válidos para importar")
            setIsUploading(false)
            return
          }

          // Insertar asistentes en la base de datos
          let successCount = 0
          let errorCount = 0

          for (let i = 0; i < validAsistentes.length; i++) {
            const asistente = validAsistentes[i]
            const code = generateRandomCode()

            // Actualizar progreso
            setProgress(Math.round((i / validAsistentes.length) * 100))

            try {
              const { error } = await supabase.from("attendants").insert({
                name: asistente.nombre,
                second_name: asistente.apellido,
                email: asistente.email,
                checked_in: false,
                ticket_id: selectedTicket,
                code,
                event_id: eventId,
              })

              if (error) {
                console.error("Error al insertar asistente:", error)
                errorCount++
              } else {
                successCount++
              }
            } catch (error) {
              console.error("Error al insertar asistente:", error)
              errorCount++
            }
          }

          setProgress(100)
          setSuccess(
            `Se importaron ${successCount} asistentes correctamente${errorCount > 0 ? ` (${errorCount} errores)` : ""}`,
          )

          // Notificar que se completó la importación
          if (successCount > 0) {
            onComplete()
          }
        } catch (error) {
          console.error("Error al procesar el archivo:", error)
          setError("Error al procesar el archivo")
        } finally {
          setIsUploading(false)
        }
      }

      reader.onerror = () => {
        setError("Error al leer el archivo")
        setIsUploading(false)
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error("Error al subir asistentes:", error)
      setError("Error al subir asistentes")
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreviewData([])
    setError(null)
    setSuccess(null)
    setProgress(0)
    setStep(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar asistentes desde Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="ticket">Seleccionar ticket</Label>
                <Select value={selectedTicket || ""} onValueChange={setSelectedTicket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ticket para los asistentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin ticket</SelectItem>
                    {tickets.map((ticket) => (
                      <SelectItem key={ticket.id} value={ticket.id.toString()}>
                        {ticket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Archivo Excel</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {file && (
                    <Button variant="ghost" size="icon" onClick={resetForm} className="text-red-500 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  El archivo debe contener columnas para nombre, apellido y email.
                </p>
              </div>

              {file && (
                <Alert className="bg-blue-50">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">Archivo seleccionado: {file.name}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Vista previa de datos</Label>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    Volver
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Apellido</th>
                        <th className="px-4 py-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.map((asistente, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{asistente.nombre}</td>
                          <td className="px-4 py-2">{asistente.apellido}</td>
                          <td className="px-4 py-2">{asistente.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mostrando {previewData.length} de {file?.name} registros
                </p>
              </div>

              <div>
                <Label htmlFor="ticket">Ticket seleccionado</Label>
                <div className="text-sm mt-1">
                  {tickets.find((t) => t.id.toString() === selectedTicket)?.name || "Sin ticket"}
                </div>
              </div>
            </>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Subiendo asistentes...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert className="bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {success ? "Cerrar" : "Cancelar"}
          </Button>
          {step === 2 && !success && (
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedTicket}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              {isUploading ? (
                <>Subiendo...</>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar asistentes
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportarAsistentesModal

