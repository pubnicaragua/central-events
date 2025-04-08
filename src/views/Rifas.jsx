"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import supabase from "../api/supabase"
import { Edit, Plus, Trash, Gift, Search } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import ConfirmDialog from "../components/confirm-dialog"
import AgregarRifaModal from "../components/raffles/agregar-rifa-modal"
import EditarRifaModal from "../components/raffles/editar-rifa-modal"
import SeleccionarGanadorModal from "../components/raffles/seleccionar-ganador-modal"
import VerGanadoresModal from "../components/raffles/ver-ganadores-modal"

const RifasPage = () => {
    const { eventId } = useParams()
    const [searchQuery, setSearchQuery] = useState("")
    const [raffles, setRaffles] = useState([])
    const [agregarModalOpen, setAgregarModalOpen] = useState(false)
    const [editarModalOpen, setEditarModalOpen] = useState(false)
    const [seleccionarGanadorModalOpen, setSeleccionarGanadorModalOpen] = useState(false)
    const [verGanadoresModalOpen, setVerGanadoresModalOpen] = useState(false)
    const [selectedRaffle, setSelectedRaffle] = useState(null)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [winners, setWinners] = useState({})

    // Cargar rifas
    useEffect(() => {
        fetchRaffles()
    }, [eventId])

    const fetchRaffles = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from("raffles")
                .select("*")
                .eq("event_id", eventId)
                .order("created_at", { ascending: false })

            if (error) throw error

            // Para cada rifa, obtener la cantidad de ganadores
            const rafflesWithWinners = await Promise.all(
                (data || []).map(async (raffle) => {
                    const { count, error: countError } = await supabase
                        .from("raffle_winner")
                        .select("*", { count: "exact", head: true })
                        .eq("raffle_id", raffle.id)

                    if (countError) throw countError

                    return {
                        ...raffle,
                        winnersCount: count || 0,
                    }
                }),
            )

            setRaffles(rafflesWithWinners)
        } catch (error) {
            console.error("Error al cargar las rifas:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Agregar rifa
    const handleAddRaffle = async (raffleData) => {
        try {
            const { data, error } = await supabase
                .from("raffles")
                .insert({
                    ...raffleData,
                    event_id: eventId,
                })
                .select()

            if (error) throw error

            setAgregarModalOpen(false)
            await fetchRaffles()
        } catch (error) {
            console.error("Error al agregar la rifa:", error)
        }
    }

    // Editar rifa
    const handleEditRaffle = async (raffleData) => {
        try {
            const { error } = await supabase.from("raffles").update(raffleData).eq("id", selectedRaffle.id)

            if (error) throw error

            setEditarModalOpen(false)
            await fetchRaffles()
        } catch (error) {
            console.error("Error al editar la rifa:", error)
        }
    }

    // Eliminar rifa
    const handleDeleteRaffle = async (raffleId) => {
        try {
            // Primero eliminar los ganadores asociados
            const { error: winnersError } = await supabase.from("raffle_winner").delete().eq("raffle_id", raffleId)

            if (winnersError) throw winnersError

            // Luego eliminar la rifa
            const { error } = await supabase.from("raffles").delete().eq("id", raffleId)

            if (error) throw error

            await fetchRaffles()
        } catch (error) {
            console.error("Error al eliminar la rifa:", error)
        }
    }

    const handleSelectWinner = async (attendeeId) => {
        try {
            // 1️⃣ Obtener todas las rifas del evento actual
            const { data: allRaffles, error: rafflesError } = await supabase
                .from("raffles")
                .select("id")
                .eq("event_id", eventId)

            if (rafflesError) throw rafflesError

            const raffleIds = allRaffles.map((r) => r.id)

            if (!raffleIds.length) {
                alert("No hay rifas activas para este evento.")
                return
            }

            // 2️⃣ Verificar si el asistente ya ganó alguna rifa de este evento
            const { data: existingWinner, error: checkError } = await supabase
                .from("raffle_winner")
                .select("raffle_id, attendee_id")
                .eq("attendee_id", attendeeId)
                .in("raffle_id", raffleIds)

            if (checkError) throw checkError

            if (existingWinner && existingWinner.length > 0) {
                alert("Este asistente ya ha ganado una rifa en este evento.")
                return
            }

            // 3️⃣ Registrar al ganador
            const { error: insertError } = await supabase.from("raffle_winner").insert({
                raffle_id: selectedRaffle.id,
                attendee_id: attendeeId,
            })

            if (insertError) throw insertError

            setSeleccionarGanadorModalOpen(false)
            await fetchRaffles()
        } catch (error) {
            console.error("Error al seleccionar ganador:", error)
            alert("Hubo un error al seleccionar el ganador.")
        }
    }


    // Cargar ganadores de una rifa
    const handleViewWinners = async (raffle) => {
        try {
            const { data, error } = await supabase
                .from("raffle_winner")
                .select(`
          attendee_id,
          attendants (
            id,
            name,
            second_name,
            email,
            code
          )
        `)
                .eq("raffle_id", raffle.id)

            if (error) throw error

            setWinners({
                raffle,
                winners: data.map((item) => item.attendants),
            })

            setVerGanadoresModalOpen(true)
        } catch (error) {
            console.error("Error al cargar los ganadores:", error)
        }
    }

    // Eliminar ganador
    const handleRemoveWinner = async (attendeeId) => {
        try {
            const { error } = await supabase
                .from("raffle_winner")
                .delete()
                .eq("raffle_id", winners.raffle.id)
                .eq("attendee_id", attendeeId)

            if (error) throw error

            // Actualizar la lista de ganadores
            const updatedWinners = winners.winners.filter((winner) => winner.id !== attendeeId)
            setWinners({
                ...winners,
                winners: updatedWinners,
            })

            await fetchRaffles()
        } catch (error) {
            console.error("Error al eliminar ganador:", error)
        }
    }

    const filteredRaffles = raffles.filter((raffle) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            (raffle.name && raffle.name.toLowerCase().includes(searchLower)) ||
            (raffle.description && raffle.description.toLowerCase().includes(searchLower))
        )
    })

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Rifas</h1>
                <Button onClick={() => setAgregarModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar rifa
                </Button>
            </div>

            <div className="flex items-center mb-6 relative">
                <Search className="w-4 h-4 absolute left-3 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 max-w-lg"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-8">Cargando...</div>
            ) : filteredRaffles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay rifas registradas</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRaffles.map((raffle) => (
                        <div key={raffle.id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b">
                                <h2 className="text-xl font-semibold">{raffle.name}</h2>
                                <p className="text-gray-500 mt-1">{raffle.description || "Sin descripción"}</p>
                            </div>

                            <div className="p-4 flex items-center justify-between">
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Gift className="w-3 h-3" />
                                    {raffle.winnersCount} {raffle.winnersCount === 1 ? "ganador" : "ganadores"}
                                </Badge>

                                <div className="flex gap-2">
                                    {raffle.winnersCount > 0 && (
                                        <Button variant="outline" size="sm" onClick={() => handleViewWinners(raffle)}>
                                            Ver ganadores
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedRaffle(raffle)
                                            setSeleccionarGanadorModalOpen(true)
                                        }}
                                        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                    >
                                        Seleccionar ganador
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedRaffle(raffle)
                                        setEditarModalOpen(true)
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setSelectedRaffle(raffle)
                                        setConfirmDialogOpen(true)
                                    }}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para agregar rifa */}
            <AgregarRifaModal isOpen={agregarModalOpen} onClose={() => setAgregarModalOpen(false)} onSave={handleAddRaffle} />

            {/* Modal para editar rifa */}
            {selectedRaffle && (
                <EditarRifaModal
                    isOpen={editarModalOpen}
                    onClose={() => setEditarModalOpen(false)}
                    onSave={handleEditRaffle}
                    raffle={selectedRaffle}
                />
            )}

            {/* Modal para seleccionar ganador */}
            {selectedRaffle && (
                <SeleccionarGanadorModal
                    isOpen={seleccionarGanadorModalOpen}
                    onClose={() => setSeleccionarGanadorModalOpen(false)}
                    onSelectWinner={handleSelectWinner}
                    raffle={selectedRaffle}
                    eventId={eventId}
                />
            )}

            {/* Modal para ver ganadores */}
            {winners.raffle && (
                <VerGanadoresModal
                    isOpen={verGanadoresModalOpen}
                    onClose={() => setVerGanadoresModalOpen(false)}
                    raffle={winners.raffle}
                    winners={winners.winners}
                    onRemoveWinner={handleRemoveWinner}
                />
            )}

            {/* Modal de confirmación para eliminar */}
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={() => {
                    handleDeleteRaffle(selectedRaffle?.id)
                    setConfirmDialogOpen(false)
                }}
                title="Eliminar rifa"
                description="¿Estás seguro de que deseas eliminar esta rifa? Esta acción eliminará también todos los ganadores asociados y no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    )
}

export default RifasPage

