"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import supabase from "../api/supabase"
import { toast } from "react-hot-toast"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import AddAmenityModal from "../components/AddAmenityModal"
import EditAmenityModal from "../components/EditAmenityModal"
import ConfirmDialog from "../components/ConfirmDialog"

function AmenitiesManagementPage() {
    const { eventId } = useParams()
    const [amenities, setAmenities] = useState([])
    const [filteredAmenities, setFilteredAmenities] = useState([])
    const [loading, setLoading] = useState(true)
    const [, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortField, setSortField] = useState("name")
    const [sortDirection, setSortDirection] = useState("asc")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedAmenity, setSelectedAmenity] = useState(null)

    useEffect(() => {
        fetchAmenities()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, supabase])

    const fetchAmenities = async () => {
        try {
            setLoading(true)

            const { data, error } = await supabase.from("amenities").select("*").eq("event_id", eventId)

            if (error) throw error

            setAmenities(data || [])
            setFilteredAmenities(data || [])
        } catch (err) {
            console.error("Error fetching amenities:", err)
            setError("Error al cargar las amenidades")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Aplicar filtros y búsqueda
        let result = [...amenities]

        // Filtrar por búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (amenity) => amenity.name?.toLowerCase().includes(query) || amenity.description?.toLowerCase().includes(query),
            )
        }

        // Ordenar resultados
        result.sort((a, b) => {
            let fieldA, fieldB

            // Determinar los campos a comparar según el campo de ordenamiento
            switch (sortField) {
                case "name":
                    fieldA = (a.name || "").toLowerCase()
                    fieldB = (b.name || "").toLowerCase()
                    break
                case "price":
                    fieldA = Number.parseFloat(a.price) || 0
                    fieldB = Number.parseFloat(b.price) || 0
                    break
                case "quantity":
                    fieldA = a.quantity || 0
                    fieldB = b.quantity || 0
                    break
                default:
                    fieldA = a[sortField] || ""
                    fieldB = b[sortField] || ""
            }

            // Ordenar ascendente o descendente
            if (sortDirection === "asc") {
                return fieldA > fieldB ? 1 : -1
            } else {
                return fieldA < fieldB ? 1 : -1
            }
        })

        setFilteredAmenities(result)
    }, [amenities, searchQuery, sortField, sortDirection])

    const handleSort = (field) => {
        if (sortField === field) {
            // Si ya estamos ordenando por este campo, cambiamos la dirección
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            // Si es un nuevo campo, ordenamos ascendente por defecto
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const handleAddAmenity = async (amenityData) => {
        try {
            const { data, error } = await supabase
                .from("amenities")
                .insert({
                    name: amenityData.name,
                    description: amenityData.description || "",
                    price: amenityData.price,
                    quantity: amenityData.quantity,
                    event_id: eventId,
                })
                .select()

            if (error) throw error

            toast.success("Amenidad agregada correctamente")
            fetchAmenities() // Actualizamos la lista
            return { success: true, data }
        } catch (error) {
            console.error("Error adding amenity:", error)
            toast.error("Error al agregar la amenidad")
            return { success: false, error }
        }
    }

    const handleEditAmenity = async (amenityData) => {
        try {
            const { data, error } = await supabase
                .from("amenities")
                .update({
                    name: amenityData.name,
                    description: amenityData.description || "",
                    price: amenityData.price,
                    quantity: amenityData.quantity,
                })
                .eq("id", amenityData.id)
                .select()

            if (error) throw error

            toast.success("Amenidad actualizada correctamente")
            fetchAmenities() // Actualizamos la lista
            return { success: true, data }
        } catch (error) {
            console.error("Error updating amenity:", error)
            toast.error("Error al actualizar la amenidad")
            return { success: false, error }
        }
    }

    const handleDeleteAmenity = async () => {
        if (!selectedAmenity) return

        try {
            // Primero verificamos si la amenidad está siendo utilizada
            const { data: usageData, error: usageError } = await supabase
                .from("amenities_attendees")
                .select("id")
                .eq("amenitie_id", selectedAmenity.id)
                .limit(1)

            if (usageError) throw usageError

            if (usageData && usageData.length > 0) {
                toast.error("No se puede eliminar esta amenidad porque está siendo utilizada por asistentes")
                setIsDeleteDialogOpen(false)
                setSelectedAmenity(null)
                return
            }

            // Si no está siendo utilizada, procedemos a eliminarla
            const { error } = await supabase.from("amenities").delete().eq("id", selectedAmenity.id)

            if (error) throw error

            toast.success("Amenidad eliminada correctamente")
            fetchAmenities() // Actualizamos la lista
            setIsDeleteDialogOpen(false)
            setSelectedAmenity(null)
        } catch (error) {
            console.error("Error deleting amenity:", error)
            toast.error("Error al eliminar la amenidad")
        }
    }

    const openEditModal = (amenity) => {
        setSelectedAmenity(amenity)
        setIsEditModalOpen(true)
    }

    const openDeleteDialog = (amenity) => {
        setSelectedAmenity(amenity)
        setIsDeleteDialogOpen(true)
    }

    const renderSortIcon = (field) => {
        if (sortField !== field) return null
        return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Amenidades</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Búsqueda */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border rounded-md"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                {/* Tabla de amenidades */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center">Nombre {renderSortIcon("name")}</div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("price")}
                                >
                                    <div className="flex items-center">Precio {renderSortIcon("price")}</div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("quantity")}
                                >
                                    <div className="flex items-center">Cantidad {renderSortIcon("quantity")}</div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAmenities.length > 0 ? (
                                filteredAmenities.map((amenity) => (
                                    <tr key={amenity.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{amenity.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-xs truncate">{amenity.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">${Number.parseFloat(amenity.price).toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {amenity.quantity === 0 ? "Ilimitado" : amenity.quantity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openEditModal(amenity)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(amenity)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        {searchQuery
                                            ? "No se encontraron amenidades que coincidan con la búsqueda"
                                            : "No hay amenidades registradas para este evento"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para agregar amenidad */}
            {isAddModalOpen && (
                <AddAmenityModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddAmenity} />
            )}

            {/* Modal para editar amenidad */}
            {isEditModalOpen && selectedAmenity && (
                <EditAmenityModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setSelectedAmenity(null)
                    }}
                    onSubmit={handleEditAmenity}
                    amenity={selectedAmenity}
                />
            )}

            {/* Diálogo de confirmación para eliminar */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteAmenity}
                title="Eliminar amenidad"
                message={`¿Estás seguro de que deseas eliminar la amenidad "${selectedAmenity?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    )
}

export default AmenitiesManagementPage

