"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Search, Gift, Shuffle } from "lucide-react"
import supabase from "../../api/supabase"

interface SeleccionarGanadorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWinner: (attendeeId: string) => void
  raffle: any
  eventId: string
}

const SeleccionarGanadorModal: React.FC<SeleccionarGanadorModalProps> = ({
  isOpen,
  onClose,
  onSelectWinner,
  raffle,
  eventId,
}) => {
  const [attendees, setAttendees] = useState([])
  const [filteredAttendees, setFilteredAttendees] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentWinners, setCurrentWinners] = useState([])
  const [randomSelectionActive, setRandomSelectionActive] = useState(false)
  const [randomAttendee, setRandomAttendee] = useState(null)
  const [intervalId, setIntervalId] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchAttendees()
      fetchCurrentWinners()
    }

    // Limpiar el intervalo al desmontar
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isOpen, raffle?.id])

  useEffect(() => {
    filterAttendees()
  }, [searchQuery, attendees, currentWinners])

  const fetchAttendees = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("attendants")
        .select("id, name, second_name, email, code")
        .eq("event_id", eventId)
        .eq("checked_in", "true") // Solo asistentes confirmados
        .order("name", { ascending: true })

      if (error) throw error

      setAttendees(data || [])
      setFilteredAttendees(data || [])
    } catch (error) {
      console.error("Error al cargar los asistentes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentWinners = async () => {
    try {
      // Obtener todas las rifas del evento
      const { data: raffles, error: rafflesError } = await supabase
        .from("raffles")
        .select("id")
        .eq("event_id", eventId)

      if (rafflesError) throw rafflesError

      const raffleIds = raffles.map((r) => r.id)

      // Buscar ganadores en esas rifas
      const { data: winners, error: winnersError } = await supabase
        .from("raffle_winner")
        .select("attendee_id")
        .in("raffle_id", raffleIds)

      if (winnersError) throw winnersError

      const winnerIds = winners.map((w) => w.attendee_id)
      setCurrentWinners(winnerIds)
    } catch (error) {
      console.error("Error al cargar ganadores:", error)
    }
  }


  const filterAttendees = () => {
    const filtered = attendees.filter((attendee) => {
      // Excluir ganadores actuales
      if (currentWinners.includes(attendee.id)) {
        return false
      }

      // Filtrar por búsqueda
      const searchLower = searchQuery.toLowerCase()
      return (
        (attendee.name && attendee.name.toLowerCase().includes(searchLower)) ||
        (attendee.second_name && attendee.second_name.toLowerCase().includes(searchLower)) ||
        (attendee.email && attendee.email.toLowerCase().includes(searchLower)) ||
        (attendee.code && attendee.code.toLowerCase().includes(searchLower))
      )
    })

    setFilteredAttendees(filtered)
  }

  const startRandomSelection = () => {
    if (filteredAttendees.length === 0) {
      alert("No hay asistentes disponibles para seleccionar")
      return
    }

    setRandomSelectionActive(true)

    // Iniciar la animación de selección aleatoria
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredAttendees.length)
      setRandomAttendee(filteredAttendees[randomIndex])
    }, 100)

    setIntervalId(interval)

    // Detener después de 3 segundos
    setTimeout(() => {
      clearInterval(interval)
      setIntervalId(null)

      // Seleccionar ganador final
      const finalIndex = Math.floor(Math.random() * filteredAttendees.length)
      const winner = filteredAttendees[finalIndex]
      setRandomAttendee(winner)

      // Esperar un segundo más antes de mostrar el botón de confirmar
      setTimeout(() => {
        setRandomSelectionActive(false)
      }, 1000)
    }, 3000)
  }

  const handleSelectWinner = (attendeeId) => {
    onSelectWinner(attendeeId)
    setRandomAttendee(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Seleccionar ganador para: {raffle?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar asistente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={randomSelectionActive}
              />
            </div>

            <Button
              onClick={startRandomSelection}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              disabled={randomSelectionActive || filteredAttendees.length === 0}
            >
              <Shuffle className="w-4 h-4" />
              Aleatorio
            </Button>
          </div>

          {randomAttendee && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium text-green-800">
                {randomSelectionActive ? "Seleccionando..." : "¡Ganador seleccionado!"}
              </h3>
              <div className="mt-2 p-3 bg-white rounded-md shadow-sm">
                <p className="text-xl font-bold">
                  {randomAttendee.name} {randomAttendee.second_name}
                </p>
                <p className="text-gray-500">{randomAttendee.email}</p>
                <code className="block mt-1 bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {randomAttendee.code}
                </code>
              </div>

              {!randomSelectionActive && (
                <Button
                  onClick={() => handleSelectWinner(randomAttendee.id)}
                  className="mt-3 bg-green-600 hover:bg-green-700"
                >
                  Confirmar ganador
                </Button>
              )}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <h3 className="font-medium">Asistentes disponibles</h3>
              <Badge variant="outline">
                {filteredAttendees.length} {filteredAttendees.length === 1 ? "asistente" : "asistentes"}
              </Badge>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Cargando asistentes...</div>
            ) : filteredAttendees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay asistentes disponibles</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {filteredAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="px-4 py-3 border-b last:border-b-0 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">
                        {attendee.name} {attendee.second_name}
                      </p>
                      <p className="text-sm text-gray-500">{attendee.email || "Sin email"}</p>
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{attendee.code}</code>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectWinner(attendee.id)}
                      className="flex items-center gap-1"
                      disabled={randomSelectionActive}
                    >
                      <Gift className="w-3 h-3" />
                      Seleccionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={randomSelectionActive}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SeleccionarGanadorModal

