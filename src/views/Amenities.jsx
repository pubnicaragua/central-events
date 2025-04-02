"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import supabase from "../api/supabase"
import { AlertCircle, Edit, Plus, Trash } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Alert, AlertDescription } from "../components/ui/alert"
import AgregarAmenidadModal from "../components/amenities/agregar-amenidad-modal"
import EditarAmenidadModal from "../components/amenities/editar-amenidad-modal"
import AgregarSeccionModal from "../components/amenities/agregar-seccion-modal"
import EditarSeccionModal from "../components/amenities/editar-seccion-modal"
import ConfirmDialog from "../components/confirm-dialog"

const AmenidadesPage = () => {
    const { eventId } = useParams()
    const [searchQuery, setSearchQuery] = useState("")
    const [sections, setSections] = useState([])
    const [sectionModalOpen, setSectionModalOpen] = useState(false)
    const [editSectionModalOpen, setEditSectionModalOpen] = useState(false)
    const [amenidadModalOpen, setAmenidadModalOpen] = useState(false)
    const [editAmenidadModalOpen, setEditAmenidadModalOpen] = useState(false)
    const [selectedAmenidad, setSelectedAmenidad] = useState(null)
    const [selectedSection, setSelectedSection] = useState(null)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [deleteAction, setDeleteAction] = useState({ type: "", id: null })
    const [isLoading, setIsLoading] = useState(true)

    // Cargar secciones y amenidades
    useEffect(() => {
        fetchSections()
    }, [eventId])

    const fetchSections = async () => {
        try {
            setIsLoading(true)
            // Obtener secciones y sus amenidades
            const { data: sectionData, error: sectionError } = await supabase
                .from("amenities_sections")
                .select("*")
                .eq("event_id", eventId)
                .order("created_at", { ascending: true })

            if (sectionError) throw sectionError

            // Si no hay secciones, preguntar si desea crear una
            if (sectionData.length === 0) {
                setSectionModalOpen(true)
            }

            // Para cada sección, obtener sus amenidades
            const sectionsWithAmenities = await Promise.all(
                sectionData.map(async (section) => {
                    const { data: amenities, error: amenitiesError } = await supabase
                        .from("amenities")
                        .select("*")
                        .eq("section_id", section.id)
                        .order("name", { ascending: true })

                    if (amenitiesError) throw amenitiesError

                    return {
                        ...section,
                        amenities: amenities || [],
                    }
                }),
            )

            setSections(sectionsWithAmenities)
        } catch (error) {
            console.error("Error al cargar los datos:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Agregar nueva sección
    const handleAddSection = async (sectionData) => {
        try {
            // Verificar si es la primera sección para marcarla como predeterminada
            const isFirstSection = sections.length === 0

            const { data, error } = await supabase
                .from("amenities_sections")
                .insert({
                    ...sectionData,
                    event_id: eventId,
                    is_default: isFirstSection,
                })
                .select()

            if (error) throw error

            setSectionModalOpen(false)
            await fetchSections()
        } catch (error) {
            console.error("Error al agregar la sección:", error)
        }
    }

    // Editar sección
    const handleEditSection = async (sectionData) => {
        try {
            const { data, error } = await supabase
                .from("amenities_sections")
                .update({ name: sectionData.name })
                .eq("id", selectedSection.id)
                .select()

            if (error) throw error

            setEditSectionModalOpen(false)
            await fetchSections()
        } catch (error) {
            console.error("Error al editar la sección:", error)
        }
    }

    // Eliminar sección
    const handleDeleteSection = async (sectionId) => {
        try {
            // Primero verificar si es la única sección o si es la predeterminada
            const isDefault = sections.find((s) => s.id === sectionId)?.is_default || false
            const isOnlySection = sections.length === 1

            if (isOnlySection) {
                alert("No puedes eliminar la única sección. Debe existir al menos una sección.")
                return
            }

            const { error } = await supabase.from("amenities_sections").delete().eq("id", sectionId)

            if (error) throw error

            // Si era la predeterminada, asignar otra como predeterminada
            if (isDefault) {
                const firstRemainingSection = sections.find((s) => s.id !== sectionId)
                if (firstRemainingSection) {
                    await supabase.from("amenities_sections").update({ is_default: true }).eq("id", firstRemainingSection.id)
                }
            }

            await fetchSections()
        } catch (error) {
            console.error("Error al eliminar la sección:", error)
        }
    }

    // Marcar sección como predeterminada
    const handleSetDefaultSection = async (sectionId) => {
        try {
            // Primero, quitar la marca predeterminada de cualquier otra sección
            const { error: clearError } = await supabase
                .from("amenities_sections")
                .update({ is_default: false })
                .eq("event_id", eventId)

            if (clearError) throw clearError

            // Luego marcar la sección seleccionada como predeterminada
            const { error: updateError } = await supabase
                .from("amenities_sections")
                .update({ is_default: true })
                .eq("id", sectionId)

            if (updateError) throw updateError

            // Asignar todas las amenidades de esta sección a todos los asistentes
            const section = sections.find((s) => s.id === sectionId)
            if (section && section.amenities.length > 0) {
                // Obtener todos los asistentes del evento
                const { data: attendees, error: attendeesError } = await supabase
                    .from("attendants")
                    .select("id")
                    .eq("event_id", eventId)

                if (attendeesError) throw attendeesError

                // Para cada amenidad y asistente, crear un registro en amenities_attendees
                // si no existe ya
                for (const amenity of section.amenities) {
                    for (const attendee of attendees) {
                        // Verificar si ya existe esta asignación
                        const { data: existing, error: checkError } = await supabase
                            .from("amenities_attendees")
                            .select()
                            .eq("amenitie_id", amenity.id)
                            .eq("attendee_id", attendee.id)

                        if (checkError) throw checkError

                        if (!existing || existing.length === 0) {
                            // Si no existe, crear la asignación
                            const { error: insertError } = await supabase.from("amenities_attendees").insert({
                                amenitie_id: amenity.id,
                                attendee_id: attendee.id,
                                quantity: 1,
                                total: amenity.price || 0,
                                is_active: true,
                            })

                            if (insertError) throw insertError
                        }
                    }
                }
            }

            await fetchSections()
        } catch (error) {
            console.error("Error al establecer sección predeterminada:", error)
        }
    }

    // Agregar amenidad a una sección
    const handleAddAmenidad = async (amenidadData, sectionId) => {
        try {
            // Agregar amenidad
            const { data: amenidadCreada, error } = await supabase
                .from("amenities")
                .insert({
                    ...amenidadData,
                    section_id: sectionId,
                    event_id: eventId,
                })
                .select()

            if (error) throw error

            // Si pertenece a la sección predeterminada, asignar a todos los asistentes
            const isDefaultSection = sections.find((s) => s.id === sectionId)?.is_default || false

            if (isDefaultSection && amenidadCreada?.[0]) {
                // Obtener todos los asistentes del evento
                const { data: attendees, error: attendeesError } = await supabase
                    .from("attendants")
                    .select("id")
                    .eq("event_id", eventId)

                if (attendeesError) throw attendeesError

                // Para cada asistente, crear un registro en amenities_attendees
                const amenityId = amenidadCreada[0].id
                const amenityPrice = amenidadCreada[0].price || 0

                for (const attendee of attendees) {
                    const { error: insertError } = await supabase.from("amenities_attendees").insert({
                        amenitie_id: amenityId,
                        attendee_id: attendee.id,
                        quantity: 1,
                        total: amenityPrice,
                        is_active: true,
                    })

                    if (insertError) throw insertError
                }
            }

            setAmenidadModalOpen(false)
            await fetchSections()
        } catch (error) {
            console.error("Error al agregar la amenidad:", error)
        }
    }

    // Editar amenidad
    const handleEditAmenidad = async (amenidadData) => {
        try {
            const { data, error } = await supabase
                .from("amenities")
                .update({
                    name: amenidadData.name,
                    description: amenidadData.description,
                    quantity: amenidadData.quantity,
                })
                .eq("id", selectedAmenidad.id)
                .select()

            if (error) throw error

            setEditAmenidadModalOpen(false)
            await fetchSections()
        } catch (error) {
            console.error("Error al editar la amenidad:", error)
        }
    }

    // Eliminar amenidad
    const handleDeleteAmenidad = async (amenidadId) => {
        try {
            const { error } = await supabase.from("amenities").delete().eq("id", amenidadId)

            if (error) throw error

            await fetchSections()
        } catch (error) {
            console.error("Error al eliminar la amenidad:", error)
        }
    }

    const handleConfirmDelete = () => {
        if (deleteAction.type === "section") {
            handleDeleteSection(deleteAction.id)
        } else if (deleteAction.type === "amenidad") {
            handleDeleteAmenidad(deleteAction.id)
        }
        setConfirmDialogOpen(false)
    }

    const filteredSections = sections.filter((section) => {
        return (
            section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.amenities.some(
                (amenidad) =>
                    amenidad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    amenidad.description?.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        )
    })

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Amenidades</h1>
                <Button onClick={() => setSectionModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar nueva sección
                </Button>
            </div>

            <div className="mb-6">
                <Input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-lg"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-8">Cargando...</div>
            ) : filteredSections.length === 0 ? (
                <div className="text-center py-8">
                    <p>No hay secciones o amenidades disponibles.</p>
                    <Button onClick={() => setSectionModalOpen(true)} className="mt-2" variant="outline">
                        Agregar una sección
                    </Button>
                </div>
            ) : (
                filteredSections.map((section) => (
                    <div key={section.id} className="mb-10 bg-white rounded-lg shadow">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold">{section.name}</h2>
                                {section.is_default && (
                                    <Badge variant="default" className="bg-blue-500">
                                        Predeterminada
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {!section.is_default && (
                                    <Button variant="outline" size="sm" onClick={() => handleSetDefaultSection(section.id)}>
                                        Marcar como predeterminada
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedSection(section)
                                        setEditSectionModalOpen(true)
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setDeleteAction({ type: "section", id: section.id })
                                        setConfirmDialogOpen(true)
                                    }}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {section.is_default && (
                            <Alert className="m-4 bg-blue-50">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Atención: Esta sección es predeterminada, por lo tanto las amenidades se irán agregando a todos los
                                    asistentes por defecto, asegúrate de tener todos en la lista, si no, los tendrás que agregar
                                    manualmente luego.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="p-4 flex justify-end">
                            <Button
                                size="sm"
                                onClick={() => {
                                    setSelectedSection(section)
                                    setAmenidadModalOpen(true)
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar amenidad
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            {section.amenities.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No hay amenidades en esta sección</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-t border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left">NOMBRE</th>
                                            <th className="px-4 py-2 text-left">DESCRIPCIÓN</th>
                                            <th className="px-4 py-2 text-left">CANTIDAD</th>
                                            <th className="px-4 py-2 text-right">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.amenities.map((amenidad) => (
                                            <tr key={amenidad.id} className="border-b">
                                                <td className="px-4 py-4">{amenidad.name}</td>
                                                <td className="px-4 py-4">{amenidad.description || "-"}</td>
                                                <td className="px-4 py-4">{amenidad.quantity || "-"}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedAmenidad(amenidad)
                                                                setEditAmenidadModalOpen(true)
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                setDeleteAction({ type: "amenidad", id: amenidad.id })
                                                                setConfirmDialogOpen(true)
                                                            }}
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                ))
            )}

            {/* Modal para agregar sección */}
            <AgregarSeccionModal
                isOpen={sectionModalOpen}
                onClose={() => setSectionModalOpen(false)}
                onSave={handleAddSection}
            />

            {/* Modal para editar sección */}
            <EditarSeccionModal
                isOpen={editSectionModalOpen}
                onClose={() => setEditSectionModalOpen(false)}
                onSave={handleEditSection}
                section={selectedSection}
            />

            {/* Modal para agregar amenidad */}
            <AgregarAmenidadModal
                isOpen={amenidadModalOpen}
                onClose={() => setAmenidadModalOpen(false)}
                onSave={(amenidadData) => handleAddAmenidad(amenidadData, selectedSection?.id)}
                sectionName={selectedSection?.name}
            />

            {/* Modal para editar amenidad */}
            <EditarAmenidadModal
                isOpen={editAmenidadModalOpen}
                onClose={() => setEditAmenidadModalOpen(false)}
                onSave={handleEditAmenidad}
                amenidad={selectedAmenidad}
            />

            {/* Modal de confirmación para eliminar */}
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Eliminar ${deleteAction.type === "section" ? "sección" : "amenidad"}`}
                description={
                    deleteAction.type === "section"
                        ? "Al eliminar esta sección, se eliminarán todas las amenidades asociadas. ¿Estás seguro de que deseas continuar?"
                        : "¿Estás seguro de que deseas eliminar esta amenidad?"
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    )
}

export default AmenidadesPage

