"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { Mail, Loader2, Check, AlertCircle, Search} from 'lucide-react'
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Input } from "../../components/ui/input"
import QRCode from "qrcode"
import emailjs from "@emailjs/browser"

interface BulkEmailModalProps {
    isOpen: boolean
    onClose: () => void
    attendees: any[]
    eventId: string
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ isOpen, onClose, attendees, eventId }) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
    const [isSending, setIsSending] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [results, setResults] = useState<{
        success: number;
        failed: number;
        total: number;
        errors: Record<string, string>;
    }>({
        success: 0,
        failed: 0,
        total: 0,
        errors: {}
    })
    const [statusMessage, setStatusMessage] = useState<{
        type: "success" | "error" | "info" | null;
        message: string | null;
    }>({ type: null, message: null })

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("")
            setSelectedAttendees([])
            setIsSending(false)
            setProgress(0)
            setCurrentIndex(0)
            setResults({
                success: 0,
                failed: 0,
                total: 0,
                errors: {}
            })
            setStatusMessage({ type: null, message: null })
        }
    }, [isOpen])

    // Filter attendees based on search query
    const filteredAttendees = attendees.filter(attendee => {
        const searchLower = searchQuery.toLowerCase()
        return (
            (attendee.name && attendee.name.toLowerCase().includes(searchLower)) ||
            (attendee.second_name && attendee.second_name.toLowerCase().includes(searchLower)) ||
            (attendee.email && attendee.email.toLowerCase().includes(searchLower)) ||
            (attendee.code && attendee.code.toLowerCase().includes(searchLower))
        )
    })

    // Handle select all checkbox
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedAttendees(filteredAttendees.map(a => a.id))
        } else {
            setSelectedAttendees([])
        }
    }

    // Toggle selection of an attendee
    const toggleAttendee = (attendeeId: string) => {
        setSelectedAttendees(prev => {
            if (prev.includes(attendeeId)) {
                return prev.filter(id => id !== attendeeId)
            } else {
                return [...prev, attendeeId]
            }
        })
    }

    // Send emails to selected attendees
    const handleSendEmails = async () => {
        const selectedAttendeesData = attendees.filter(a => selectedAttendees.includes(a.id))
        const attendeesWithEmail = selectedAttendeesData.filter(a => a.email)

        if (attendeesWithEmail.length === 0) {
            setStatusMessage({
                type: "error",
                message: "Ninguno de los asistentes seleccionados tiene correo electrónico"
            })
            return
        }

        setIsSending(true)
        setProgress(0)
        setCurrentIndex(0)
        setResults({
            success: 0,
            failed: 0,
            total: attendeesWithEmail.length,
            errors: {}
        })
        setStatusMessage({
            type: "info",
            message: `Enviando correos a ${attendeesWithEmail.length} asistentes...`
        })

        // Send emails one by one to avoid rate limiting
        for (let i = 0; i < attendeesWithEmail.length; i++) {
            const attendee = attendeesWithEmail[i]
            setCurrentIndex(i)

            try {
                // Generate QR code
                const qrPayload = {
                    attendeeId: attendee.id,
                    eventId: String(eventId),
                    code: attendee.code,
                    name: `${attendee.name} ${attendee.second_name || ""}`.trim(),
                }

                const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload))
                const attendeeLink = `http://localhost:5173/events/${eventId}?attendeeId=${attendee.id}`

                const templateParams = {
                    to_email: attendee.email,
                    to_name: `${attendee.name} ${attendee.second_name || ""}`.trim(),
                    attendee_code: attendee.code,
                    event_link: attendeeLink,
                    qr_image: qrDataUrl,
                }

                // Send email using EmailJS (same as in QrCodeModal)
                await emailjs.send("service_ckfmlwl", "template_20jh7dj", templateParams, "pIiR9nD5kGdXBVnp7")

                // Update success count
                setResults(prev => ({
                    ...prev,
                    success: prev.success + 1
                }))
            } catch (error) {
                console.error(`Error al enviar correo a ${attendee.email}:`, error)

                // Update failed count and record error
                setResults(prev => ({
                    ...prev,
                    failed: prev.failed + 1,
                    errors: {
                        ...prev.errors,
                        [attendee.id]: error instanceof Error ? error.message : "Error desconocido"
                    }
                }))
            }

            // Update progress
            const newProgress = Math.round(((i + 1) / attendeesWithEmail.length) * 100)
            setProgress(newProgress)

            // Small delay to avoid overwhelming the email service
            if (i < attendeesWithEmail.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300))
            }
        }

        // Set final status message
        setStatusMessage({
            type: results.failed > 0 ? "error" : "success",
            message: `Proceso completado: ${results.success} correos enviados correctamente${results.failed > 0 ? `, ${results.failed} fallidos` : ""
                }`
        })

        setIsSending(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Enviar correos masivos</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {!isSending ? (
                        <>
                            <div className="flex items-center mb-4 relative">
                                <Search className="w-4 h-4 absolute left-3 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar asistentes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="border rounded-md overflow-hidden">
                                <div className="bg-gray-50 p-2 border-b flex items-center">
                                    <Checkbox
                                        id="select-all"
                                        checked={filteredAttendees.length > 0 && selectedAttendees.length === filteredAttendees.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor="select-all" className="ml-2 flex-1 cursor-pointer">
                                        Seleccionar todos ({filteredAttendees.length})
                                    </Label>
                                    <div className="text-sm text-gray-500">
                                        {selectedAttendees.length} seleccionados
                                    </div>
                                </div>

                                <div className="max-h-[40vh] overflow-y-auto">
                                    {filteredAttendees.length > 0 ? (
                                        <div className="divide-y">
                                            {filteredAttendees.map((attendee) => (
                                                <div key={attendee.id} className="p-2 flex items-center hover:bg-gray-50">
                                                    <Checkbox
                                                        id={`attendee-${attendee.id}`}
                                                        checked={selectedAttendees.includes(attendee.id)}
                                                        onCheckedChange={() => toggleAttendee(attendee.id)}
                                                        disabled={!attendee.email}
                                                    />
                                                    <Label
                                                        htmlFor={`attendee-${attendee.id}`}
                                                        className={`ml-2 flex-1 cursor-pointer ${!attendee.email ? 'text-gray-400' : ''}`}
                                                    >
                                                        <div className="font-medium">
                                                            {attendee.name} {attendee.second_name || ''}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            {attendee.email || <span className="text-red-500 italic">Sin correo</span>}
                                                        </div>
                                                    </Label>
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {attendee.code}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No se encontraron asistentes
                                        </div>
                                    )}
                                </div>
                            </div>

                            {statusMessage.type && (
                                <Alert className={
                                    statusMessage.type === "success" ? "bg-green-50" :
                                        statusMessage.type === "error" ? "bg-red-50" :
                                            "bg-blue-50"
                                }>
                                    {statusMessage.type === "success" ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : statusMessage.type === "error" ? (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    )}
                                    <AlertDescription className={
                                        statusMessage.type === "success" ? "text-green-800" :
                                            statusMessage.type === "error" ? "text-red-800" :
                                                "text-blue-800"
                                    }>
                                        {statusMessage.message}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="text-center mb-4">
                                <h3 className="font-medium text-lg mb-1">Enviando correos electrónicos</h3>
                                <p className="text-gray-500">
                                    Procesando asistente {currentIndex + 1} de {results.total}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progreso</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center py-4">
                                <div>
                                    <div className="text-2xl font-bold">{results.total}</div>
                                    <div className="text-sm text-gray-500">Total</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{results.success}</div>
                                    <div className="text-sm text-gray-500">Enviados</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                                    <div className="text-sm text-gray-500">Fallidos</div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {isSending ? (
                        <Button variant="outline" onClick={onClose} disabled>
                            Por favor espere...
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSendEmails}
                                disabled={selectedAttendees.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Enviar {selectedAttendees.length > 0 ? `(${selectedAttendees.length})` : ''}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default BulkEmailModal
