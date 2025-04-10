"use client"

import { useState, useEffect } from "react"
import { getAllModules, createModule, updateModule, deleteModule } from "../components/lib/actions/modules"
import { Plus, Edit, Trash2, Save, X, Power } from "lucide-react"

const ModulesPage = () => {
    const [modules, setModules] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingModule, setEditingModule] = useState(null)
    const [formData, setFormData] = useState({
        module_name: "",
        module_key: "",
        is_enabled: true,
    })

    useEffect(() => {
        fetchModules()
    }, [])

    const fetchModules = async () => {
        setLoading(true)
        try {
            const data = await getAllModules()
            setModules(data)
        } catch (error) {
            console.error("Error al cargar módulos:", error)
            alert("Error al cargar módulos")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateModule = () => {
        setEditingModule(null)
        setFormData({
            module_name: "",
            module_key: "",
            is_enabled: true,
        })
        setModalVisible(true)
    }

    const handleEditModule = (module) => {
        setEditingModule(module)
        setFormData({
            module_name: module.module_name,
            module_key: module.module_key,
            is_enabled: module.is_enabled,
        })
        setModalVisible(true)
    }

    const handleDeleteModule = async (moduleId) => {
        if (
            !window.confirm(
                "¿Estás seguro de eliminar este módulo? Esta acción eliminará también todos los permisos asociados.",
            )
        ) {
            return
        }

        try {
            await deleteModule(moduleId)
            alert("Módulo eliminado correctamente")
            fetchModules()
        } catch (error) {
            console.error("Error al eliminar módulo:", error)
            alert("Error al eliminar módulo")
        }
    }

    const handleToggleStatus = async (module) => {
        try {
            await updateModule(module.id, { is_enabled: !module.is_enabled })
            fetchModules()
        } catch (error) {
            console.error("Error al cambiar estado del módulo:", error)
            alert("Error al cambiar estado del módulo")
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingModule) {
                await updateModule(editingModule.id, formData)
                alert("Módulo actualizado correctamente")
            } else {
                await createModule(formData)
                alert("Módulo creado correctamente")
            }

            setModalVisible(false)
            fetchModules()
        } catch (error) {
            console.error("Error al guardar módulo:", error)
            alert("Error al guardar módulo")
        }
    }

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Gestión de Módulos</h2>

                    <div className="flex justify-end mb-4">
                        <button
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={handleCreateModule}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Crear Módulo
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left p-3 border-b">Nombre</th>
                                    <th className="text-left p-3 border-b">Clave</th>
                                    <th className="text-left p-3 border-b">Estado</th>
                                    <th className="text-left p-3 border-b">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-3 text-center">
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : modules.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-3 text-center">
                                            No hay módulos disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    modules.map((module) => (
                                        <tr key={module.id} className="hover:bg-gray-50">
                                            <td className="p-3 border-b">{module.module_name}</td>
                                            <td className="p-3 border-b">{module.module_key}</td>
                                            <td className="p-3 border-b">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${module.is_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                                >
                                                    {module.is_enabled ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="p-3 border-b">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                        onClick={() => handleEditModule(module)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                        onClick={() => handleToggleStatus(module)}
                                                    >
                                                        <Power className="h-4 w-4 mr-1" />
                                                        {module.is_enabled ? "Desactivar" : "Activar"}
                                                    </button>
                                                    <button
                                                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                        onClick={() => handleDeleteModule(module.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal para crear/editar módulo */}
            {modalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editingModule ? "Editar Módulo" : "Crear Módulo"}</h3>
                            <button onClick={() => setModalVisible(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Nombre del Módulo</label>
                                <input
                                    name="module_name"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.module_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Clave del Módulo</label>
                                <input
                                    name="module_key"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.module_key}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="ej: eventDashboard, adminUsers"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    La clave debe coincidir con la utilizada en el código para verificar permisos.
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_enabled"
                                        checked={formData.is_enabled}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium">Módulo Activo</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                                    onClick={() => setModalVisible(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4 mr-1" />
                                    {editingModule ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ModulesPage
