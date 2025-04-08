"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import supabase from "../api/supabase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserCheck, UserX, RefreshCw } from "lucide-react"
import CheckInScanner from "../components/CheckInScanner"
import UserMenu from "../components/UserMenu"
import  useAuth  from "../hooks/useAuth"

const CheckInPage = () => {
    const { eventId } = useParams()
    const [event, setEvent] = useState(null)
    const [attendees, setAttendees] = useState([])
    const [filteredAttendees, setFilteredAttendees] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        checkedIn: 0,
        pending: 0,
    })
    const { user } = useAuth()
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        fetchEventData()
        fetchAttendees()
        if (user) {
            fetchUserRole()
        }
    }, [eventId, user])

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredAttendees(attendees)
        } else {
            const filtered = attendees.filter(
                (attendee) =>
                    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (attendee.second_name && attendee.second_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (attendee.email && attendee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    attendee.code.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setFilteredAttendees(filtered)
        }
    }, [searchTerm, attendees])

    const fetchUserRole = async () => {
        try {
            const { data, error } = await supabase.from("user_roles").select("role_id").eq("user_id", user.id).single()

            if (error) throw error
            setUserRole(data.role_id)
        } catch (error) {
            console.error("Error fetching user role:", error)
        }
    }

    const fetchEventData = async () => {
        try {
            // Verificar si el usuario tiene acceso a este evento
            if (user) {
                const { data: userProfile, error: profileError } = await supabase
                    .from("user_profile")
                    .select("event_id")
                    .eq("auth_id", user.id)
                    .single()

                if (profileError && profileError.code !== "PGRST116") {
                    console.error("Error fetching user profile:", profileError)
                }

                // Si el usuario no es admin (role_id = 1) y tiene un evento asignado diferente, redirigir
                if (userRole !== 1 && userProfile && userProfile.event_id && userProfile.event_id !== eventId) {
                    console.error("No tienes acceso a este evento")
                    // Aquí podrías redirigir o mostrar un mensaje de error
                    return
                }
            }

            const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

            if (error) throw error
            setEvent(data)
        } catch (error) {
            console.error("Error fetching event:", error)
        }
    }

    const fetchAttendees = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("attendants")
                .select("*, tickets(*)")
                .eq("event_id", eventId)
                .order("name", { ascending: true })

            if (error) throw error

            setAttendees(data)
            setFilteredAttendees(data)

            // Calculate stats
            const checkedIn = data.filter((a) => a.checked_in).length
            setStats({
                total: data.length,
                checkedIn: checkedIn,
                pending: data.length - checkedIn,
            })
        } catch (error) {
            console.error("Error fetching attendees:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCheckIn = async (attendeeId) => {
        try {
            const { error } = await supabase
                .from("attendants")
                .update({
                    checked_in: true,
                    checked_in_at: new Date().toISOString(),
                })
                .eq("id", attendeeId)

            if (error) throw error

            // Update local state
            const updatedAttendees = attendees.map((attendee) => {
                if (attendee.id === attendeeId) {
                    return { ...attendee, checked_in: true, checked_in_at: new Date().toISOString() }
                }
                return attendee
            })

            setAttendees(updatedAttendees)

            // Update stats
            const checkedIn = updatedAttendees.filter((a) => a.checked_in).length
            setStats({
                total: updatedAttendees.length,
                checkedIn: checkedIn,
                pending: updatedAttendees.length - checkedIn,
            })
        } catch (error) {
            console.error("Error updating check-in status:", error)
        }
    }

    const handleUndoCheckIn = async (attendeeId) => {
        try {
            const { error } = await supabase
                .from("attendants")
                .update({
                    checked_in: false,
                    checked_in_at: null,
                })
                .eq("id", attendeeId)

            if (error) throw error

            // Update local state
            const updatedAttendees = attendees.map((attendee) => {
                if (attendee.id === attendeeId) {
                    return { ...attendee, checked_in: false, checked_in_at: null }
                }
                return attendee
            })

            setAttendees(updatedAttendees)

            // Update stats
            const checkedIn = updatedAttendees.filter((a) => a.checked_in).length
            setStats({
                total: updatedAttendees.length,
                checkedIn: checkedIn,
                pending: updatedAttendees.length - checkedIn,
            })
        } catch (error) {
            console.error("Error updating check-in status:", error)
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
        } catch (error) {
            return dateString
        }
    }

    const handleScannerSuccess = (attendeeData) => {
        // Refresh the attendees list after successful check-in
        fetchAttendees()
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Check-in de asistentes</h1>
                    {event && <p className="text-gray-600">Evento: {event.name}</p>}
                </div>
                <UserMenu />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Porcentaje</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="list">Lista de asistentes</TabsTrigger>
                    <TabsTrigger value="scanner">Escáner QR</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <div className="flex items-center mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Buscar por nombre, email o código..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="ml-2" onClick={fetchAttendees}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Actualizar
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Ticket</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">
                                            Cargando asistentes...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAttendees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">
                                            No se encontraron asistentes
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAttendees.map((attendee) => (
                                        <TableRow key={attendee.id}>
                                            <TableCell>
                                                {attendee.name} {attendee.second_name || ""}
                                            </TableCell>
                                            <TableCell>{attendee.email || "-"}</TableCell>
                                            <TableCell>
                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{attendee.code}</code>
                                            </TableCell>
                                            <TableCell>{attendee.tickets?.name || "-"}</TableCell>
                                            <TableCell>
                                                {attendee.checked_in ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                                        Registrado {attendee.checked_in_at && `(${formatDateTime(attendee.checked_in_at)})`}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600">
                                                        Pendiente
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {attendee.checked_in ? (
                                                    <Button variant="ghost" size="sm" onClick={() => handleUndoCheckIn(attendee.id)}>
                                                        <UserX className="h-4 w-4 mr-1" />
                                                        Deshacer
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="sm" onClick={() => handleCheckIn(attendee.id)}>
                                                        <UserCheck className="h-4 w-4 mr-1" />
                                                        Registrar
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="scanner">
                    <div className="flex justify-center">
                        <CheckInScanner eventId={eventId} onSuccess={handleScannerSuccess} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default CheckInPage
