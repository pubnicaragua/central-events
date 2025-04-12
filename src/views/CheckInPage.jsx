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
import useAuth from "../hooks/useAuth"

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
  const [hasAmenities, setHasAmenities] = useState(false)
  const [allAmenities, setAllAmenities] = useState([])
  const [employeeAmenities, setEmployeeAmenities] = useState([])
  const [loadingAmenities, setLoadingAmenities] = useState(false)

  useEffect(() => {
    fetchEventData()
    fetchAttendees()
    if (user) {
      fetchUserRole()
      checkEmployeeHasAmenities(user.id)
      fetchAllAmenities()
      fetchEmployeeAmenities(user.id)
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

  const checkEmployeeHasAmenities = async (userId) => {
    try {
      if (!userId) return false

      const { data, error } = await supabase.from("amenities").select("id").eq("user_id", userId).limit(1)

      if (error) throw error
      setHasAmenities(data && data.length > 0)
      return data && data.length > 0
    } catch (err) {
      console.error("Error checking employee amenities:", err)
      setHasAmenities(false)
      return false
    }
  }

  const fetchAllAmenities = async () => {
    try {
      setLoadingAmenities(true)
      const { data, error } = await supabase
        .from("amenities")
        .select(`
                    id,
                    name,
                    description,
                    price,
                    section_id,
                    user_id,
                    amenities_sections (
                        id,
                        name,
                        is_default
                    )
                `)
        .order("name")

      if (error) throw error
      setAllAmenities(data)
    } catch (error) {
      console.error("Error fetching all amenities:", error)
    } finally {
      setLoadingAmenities(false)
    }
  }

  const fetchEmployeeAmenities = async (userId) => {
    try {
      setLoadingAmenities(true)
      const { data, error } = await supabase
        .from("amenities")
        .select(`
                    id,
                    name,
                    description,
                    price,
                    section_id,
                    user_id,
                    amenities_sections (
                        id,
                        name,
                        is_default
                    )
                `)
        .eq("user_id", userId)
        .order("name")

      if (error) throw error
      setEmployeeAmenities(data)
    } catch (error) {
      console.error("Error fetching employee amenities:", error)
    } finally {
      setLoadingAmenities(false)
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
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">Check-in de asistentes</h1>
        {event && <p className="text-gray-600">Evento: {event.name}</p>}
        {user && (
          <p className="text-gray-600">
            Empleado número: {user.id}. {hasAmenities ? "Empleado de amenidades" : "Empleado de check in"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-base md:text-lg">Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-base md:text-lg">Registrados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.checkedIn}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-base md:text-lg">Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl md:text-3xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-base md:text-lg">Porcentaje</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl md:text-3xl font-bold">
              {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6 flex flex-wrap w-full border border-gray-200 rounded-md p-1 bg-gray-50">
          <TabsTrigger value="list" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Lista
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Escáner
          </TabsTrigger>
          <TabsTrigger
            value="all-amenities"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Amenidades
          </TabsTrigger>
          {hasAmenities && (
            <TabsTrigger
              value="my-amenities"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Mis amenidades
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list">
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por nombre, email o código..."
                className="pl-9 border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="ml-2 border-gray-300" onClick={fetchAttendees}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          </div>

          <div className="space-y-4 md:rounded-md md:border md:border-gray-200">
            <div className="hidden md:table w-full">
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

            {/* Vista móvil de asistentes como tarjetas */}
            <div className="md:hidden space-y-4">
              {loading ? (
                <div className="text-center py-4">Cargando asistentes...</div>
              ) : filteredAttendees.length === 0 ? (
                <div className="text-center py-4">No se encontraron asistentes</div>
              ) : (
                filteredAttendees.map((attendee) => (
                  <Card key={attendee.id} className="overflow-hidden border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2 bg-gray-50 border-b border-gray-200">
                      <CardTitle className="text-lg">
                        {attendee.name} {attendee.second_name || ""}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2 space-y-2 pt-3">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="text-sm font-medium">Email:</div>
                        <div className="text-sm truncate">{attendee.email || "-"}</div>

                        <div className="text-sm font-medium">Código:</div>
                        <div className="text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                            {attendee.code}
                          </code>
                        </div>

                        <div className="text-sm font-medium">Ticket:</div>
                        <div className="text-sm">{attendee.tickets?.name || "-"}</div>

                        <div className="text-sm font-medium">Estado:</div>
                        <div>
                          {attendee.checked_in ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs border border-green-200">
                              Registrado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 text-xs border border-amber-200">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end border-t border-gray-100 mt-3">
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
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scanner">
          <div className="flex justify-center">
            <CheckInScanner eventId={eventId} onSuccess={handleScannerSuccess} />
          </div>
        </TabsContent>

        <TabsContent value="all-amenities">
          <div className="space-y-4">
            <div className="hidden md:block rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Sección</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingAmenities ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Cargando amenidades...
                      </TableCell>
                    </TableRow>
                  ) : allAmenities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No se encontraron amenidades
                      </TableCell>
                    </TableRow>
                  ) : (
                    allAmenities.map((amenity) => (
                      <TableRow key={amenity.id}>
                        <TableCell>{amenity.name}</TableCell>
                        <TableCell>{amenity.description || "-"}</TableCell>
                        <TableCell>${amenity.price?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>{amenity.amenities_sections?.name || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Vista móvil de amenidades como tarjetas */}
            <div className="md:hidden space-y-4">
              {loadingAmenities ? (
                <div className="text-center py-4">Cargando amenidades...</div>
              ) : allAmenities.length === 0 ? (
                <div className="text-center py-4">No se encontraron amenidades</div>
              ) : (
                allAmenities.map((amenity) => (
                  <Card key={amenity.id} className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2 bg-gray-50 border-b border-gray-200">
                      <CardTitle className="text-lg">{amenity.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-3">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="text-sm font-medium">Descripción:</div>
                        <div className="text-sm">{amenity.description || "-"}</div>

                        <div className="text-sm font-medium">Precio:</div>
                        <div className="text-sm">${amenity.price?.toFixed(2) || "0.00"}</div>

                        <div className="text-sm font-medium">Sección:</div>
                        <div className="text-sm">{amenity.amenities_sections?.name || "-"}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {hasAmenities && (
          <TabsContent value="my-amenities">
            <div className="space-y-4">
              <div className="hidden md:block rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Sección</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAmenities ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Cargando amenidades...
                        </TableCell>
                      </TableRow>
                    ) : employeeAmenities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No tienes amenidades asignadas
                        </TableCell>
                      </TableRow>
                    ) : (
                      employeeAmenities.map((amenity) => (
                        <TableRow key={amenity.id}>
                          <TableCell>{amenity.name}</TableCell>
                          <TableCell>{amenity.description || "-"}</TableCell>
                          <TableCell>${amenity.price?.toFixed(2) || "0.00"}</TableCell>
                          <TableCell>{amenity.amenities_sections?.name || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Vista móvil de mis amenidades como tarjetas */}
              <div className="md:hidden space-y-4">
                {loadingAmenities ? (
                  <div className="text-center py-4">Cargando amenidades...</div>
                ) : employeeAmenities.length === 0 ? (
                  <div className="text-center py-4">No tienes amenidades asignadas</div>
                ) : (
                  employeeAmenities.map((amenity) => (
                    <Card key={amenity.id} className="border border-gray-200 shadow-sm">
                      <CardHeader className="pb-2 bg-gray-50 border-b border-gray-200">
                        <CardTitle className="text-lg">{amenity.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-3">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-sm font-medium">Descripción:</div>
                          <div className="text-sm">{amenity.description || "-"}</div>

                          <div className="text-sm font-medium">Precio:</div>
                          <div className="text-sm">${amenity.price?.toFixed(2) || "0.00"}</div>

                          <div className="text-sm font-medium">Sección:</div>
                          <div className="text-sm">{amenity.amenities_sections?.name || "-"}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default CheckInPage
