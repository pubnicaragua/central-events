"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, MapPin, Calendar, CheckCircle } from "lucide-react"
import { getGuestDetails, performCheckIn } from "@actions/guests"
import { getEventDetails } from "@actions/events"

export default function GuestPage() {
    const { guestId } = useParams()
    const [guestData, setGuestData] = useState(null)
    const [eventData, setEventData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const guest = await getGuestDetails(guestId)
                const event = await getEventDetails(guest.event_id)
                setGuestData(guest)
                setEventData(event)
            } catch (err) {
                console.error("Error fetching guest data:", err)
                setError("No se pudo cargar la información del invitado")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [guestId])

    const handleCheckIn = async () => {
        try {
            await performCheckIn(guestId)
            setGuestData((prev) => ({ ...prev, checked_in: true }))
        } catch (err) {
            console.error("Error during check-in:", err)
            setError("No se pudo realizar el check-in")
        }
    }

    if (loading) return <div>Cargando información del invitado...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Bienvenido, {guestData.name}</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="mr-2" />
                        Detalles del Evento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-medium">{eventData.name}</p>
                    <p>{eventData.date}</p>
                    <p>{eventData.location}</p>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MapPin className="mr-2" />
                        Tu Ubicación
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Asiento: {guestData.seat}</p>
                    <p>Mesa: {guestData.table}</p>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="mr-2" />
                        Tus Amenidades
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {guestData.amenities.map((amenity, index) => (
                            <li key={index}>
                                {amenity.quantity}x {amenity.name}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Tu Menú</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Entrada: {guestData.menu.starter}</p>
                    <p>Plato Principal: {guestData.menu.main}</p>
                    <p>Postre: {guestData.menu.dessert}</p>
                </CardContent>
            </Card>

            {!guestData.checked_in && (
                <Button onClick={handleCheckIn} className="w-full">
                    <CheckCircle className="mr-2" />
                    Realizar Check-In
                </Button>
            )}

            {guestData.checked_in && <p className="text-center text-green-600 font-medium">¡Check-In Completado!</p>}
        </div>
    )
}

