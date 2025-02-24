"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getEventAmenities, createAmenityAttendee } from "@actions/amenities"
import { toast } from "sonner"

export function AmenitiesForm({ eventId, attendeeId, onComplete }) {
    const [amenities, setAmenities] = useState([])
    const [selectedAmenities, setSelectedAmenities] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        let mounted = true

        async function fetchAmenities() {
            if (!eventId) {
                setError("ID del evento no proporcionado")
                return
            }

            try {
                const data = await getEventAmenities(eventId)
                if (mounted) {
                    setAmenities(Array.isArray(data) ? data : [])
                    setError(null)
                }
            } catch (err) {
                console.error("Error fetching amenities:", err)
                if (mounted) {
                    setError("Error al cargar las amenidades")
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        setLoading(true)
        fetchAmenities()

        return () => {
            mounted = false
        }
    }, [eventId])

    const handleQuantityChange = (amenityId, quantity) => {
        const amenity = amenities.find((a) => a.id === Number(amenityId))
        if (!amenity) return

        const parsedQuantity = Math.max(0, Math.min(Number(quantity) || 0, amenity.quantity))

        if (parsedQuantity > amenity.quantity) {
            toast.error(`Solo hay ${amenity.quantity} unidades disponibles de ${amenity.name}`)
            return
        }

        setSelectedAmenities((prev) => ({
            ...prev,
            [amenityId]: {
                quantity: parsedQuantity,
                total: parsedQuantity * (amenity.price || 0),
            },
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!attendeeId) {
            setError("ID del asistente no proporcionado")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            // Filtrar solo las amenidades con cantidad > 0
            const amenityUpdates = Object.entries(selectedAmenities)
                .filter(([, data]) => data.quantity > 0)
                .map(async ([amenityId, data]) => {
                    const amenity = amenities.find((a) => a.id === Number(amenityId))
                    if (!amenity) throw new Error(`Amenidad ${amenityId} no encontrada`)

                    try {
                        await createAmenityAttendee({
                            amenityId: Number(amenityId),
                            attendeeId: attendeeId,
                            quantity: data.quantity,
                            total: data.total,
                        })

                        // Actualizar la cantidad local después de una actualización exitosa
                        setAmenities((currentAmenities) =>
                            currentAmenities.map((a) =>
                                a.id === Number(amenityId) ? { ...a, quantity: a.quantity - data.quantity } : a,
                            ),
                        )
                    } catch (error) {
                        throw new Error(`Error al procesar ${amenity.name}: ${error.message}`)
                    }
                })

            await Promise.all(amenityUpdates)
            toast.success("Amenidades guardadas correctamente")
            onComplete()
        } catch (err) {
            console.error("Error saving amenities:", err)
            setError(err.message || "Error al guardar las amenidades")
            toast.error(err.message || "Error al guardar las amenidades")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="text-center py-4">Cargando amenidades...</div>
    }

    if (error) {
        return <div className="text-red-600 py-4">{error}</div>
    }

    if (!amenities.length) {
        return <div className="text-center py-4">No hay amenidades disponibles</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {amenities.map((amenity) => (
                    <Card key={amenity.id}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                {amenity.img_url && (
                                    <img
                                        src={amenity.img_url || "/placeholder.svg"}
                                        alt={amenity.name}
                                        className="h-16 w-16 object-cover rounded-md"
                                    />
                                )}
                                <div className="flex-1">
                                    <Label htmlFor={`amenity-${amenity.id}`}>{amenity.name}</Label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Input
                                            id={`amenity-${amenity.id}`}
                                            type="number"
                                            min="0"
                                            max={amenity.quantity}
                                            value={selectedAmenities[amenity.id]?.quantity || 0}
                                            onChange={(e) => handleQuantityChange(amenity.id, e.target.value)}
                                            className="w-24"
                                            disabled={amenity.quantity === 0}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            ${amenity.price?.toFixed(2)} c/u - Disponibles: {amenity.quantity}
                                        </span>
                                        {selectedAmenities[amenity.id]?.total > 0 && (
                                            <span className="ml-auto font-medium">
                                                Total: ${selectedAmenities[amenity.id].total.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
                <div className="text-lg font-medium">
                    Total: $
                    {Object.values(selectedAmenities)
                        .reduce((sum, item) => sum + (item.total || 0), 0)
                        .toFixed(2)}
                </div>
                <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar amenidades"}
                </Button>
            </div>
        </form>
    )
}

AmenitiesForm.propTypes = {
    eventId: PropTypes.string.isRequired,
    attendeeId: PropTypes.string.isRequired,
    onComplete: PropTypes.func.isRequired,
}

