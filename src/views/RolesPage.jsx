"use client"

import { useState, useEffect } from "react"
import supabase from "../api/supabase"
import { AppWindow, Save, X } from "lucide-react"
import { getAllModules, getModulePermissionsByRole, assignModulesToRole } from "../components/lib/actions/modules"

const RolesPage = () => {
  // Estados para roles
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  // Estados para módulos
  const [modules, setModules] = useState([])
  const [moduleModalVisible, setModuleModalVisible] = useState(false)
  const [currentRole, setCurrentRole] = useState(null)
  const [selectedModules, setSelectedModules] = useState([])
  const [loadingModules, setLoadingModules] = useState(false)

  // Estados para la creación de módulos
  const [activeTab, setActiveTab] = useState("roles")

  useEffect(() => {
    fetchRoles()
    fetchModules()
  }, [])

  // Funciones para roles
  const fetchRoles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("roles").select("*")

      if (error) throw error
      setRoles(data)
    } catch (error) {
      console.error("Error fetching roles:", error)
      alert("Error al cargar roles")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = () => {
    setEditingRole(null)
    setModalVisible(true)
  }

  const handleEditRole = (role) => {
    setEditingRole(role)
    setModalVisible(true)
  }

  const handleDeleteRole = async (roleId) => {
    try {
      // Verificar si hay usuarios con este rol
      const { data: userRoles, error: checkError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role_id", roleId)

      if (checkError) throw checkError

      if (userRoles && userRoles.length > 0) {
        return alert("No se puede eliminar el rol porque está asignado a usuarios")
      }

      // Eliminar permisos de módulos asociados
      await supabase.from("modules_permission").delete().eq("role_id", roleId)

      // Eliminar el rol
      const { error } = await supabase.from("roles").delete().eq("id", roleId)

      if (error) throw error

      alert("Rol eliminado correctamente")
      fetchRoles()
    } catch (error) {
      console.error("Error deleting role:", error)
      alert("Error al eliminar rol")
    }
  }

  const handleSubmitRole = async (values) => {
    try {
      if (editingRole) {
        // Actualizar rol existente
        const { error } = await supabase
          .from("roles")
          .update({
            name: values.name,
            description: values.description,
          })
          .eq("id", editingRole.id)

        if (error) throw error
        alert("Rol actualizado correctamente")
      } else {
        // Crear nuevo rol
        const { error } = await supabase.from("roles").insert({
          name: values.name,
          description: values.description,
        })

        if (error) throw error
        alert("Rol creado correctamente")
      }

      setModalVisible(false)
      fetchRoles()
    } catch (error) {
      console.error("Error saving role:", error)
      alert("Error al guardar rol")
    }
  }

  // Funciones para módulos
  const fetchModules = async () => {
    try {
      const data = await getAllModules()
      setModules(data || [])
    } catch (error) {
      console.error("Error fetching modules:", error)
      alert("Error al cargar módulos")
    }
  }

  const handleManageModules = async (role) => {
    setCurrentRole(role)
    setLoadingModules(true)

    try {
      // Obtener los módulos asignados al rol
      const assignedModuleIds = await getModulePermissionsByRole(role.id)
      setSelectedModules(assignedModuleIds)
    } catch (error) {
      console.error("Error al cargar permisos de módulos:", error)
      alert("Error al cargar permisos de módulos")
    } finally {
      setLoadingModules(false)
      setModuleModalVisible(true)
    }
  }

  const handleModuleSelection = (moduleId) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId)
      } else {
        return [...prev, moduleId]
      }
    })
  }

  const handleSubmitModulePermissions = async () => {
    if (!currentRole) return

    try {
      await assignModulesToRole(currentRole.id, selectedModules)
      alert("Permisos de módulos actualizados correctamente")
      setModuleModalVisible(false)
      fetchRoles()
    } catch (error) {
      console.error("Error al asignar módulos:", error)
      alert("Error al asignar módulos")
    }
  }

  return (
    <div className="p-6 bg-green-50">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-green-700">Gestión de Roles y Módulos</h2>

          {/* Tabs */}
          <div className="border-b mb-4">
            <div className="flex">
              <button
                className={`py-2 px-4 font-medium ${activeTab === "roles" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("roles")}
              >
                Roles
              </button>
            </div>
          </div>

          {/* Roles Tab */}
          {activeTab === "roles" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="text-left p-3 border-b">Nombre</th>
                      <th className="text-left p-3 border-b">Descripción</th>
                      <th className="text-left p-3 border-b">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="p-3 text-center">
                          Cargando...
                        </td>
                      </tr>
                    ) : roles.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-3 text-center">
                          No hay roles disponibles
                        </td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="p-3 border-b">{role.name}</td>
                          <td className="p-3 border-b">{role.description}</td>
                          <td className="p-3 border-b">
                            <div className="flex space-x-2">
                              <button
                                className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                onClick={() => handleManageModules(role)}
                              >
                                <AppWindow className="h-4 w-4 mr-1" />
                                Módulos
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                  <p className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Los roles solo pueden ser creados, editados o eliminados por un super administrador o soporte
                    técnico.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para crear/editar rol */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingRole ? "Editar Rol" : "Crear Rol"}</h3>
              <button onClick={() => setModalVisible(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                handleSubmitRole({
                  name: formData.get("name"),
                  description: formData.get("description"),
                })
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  name="name"
                  className="w-full p-2 border rounded-md"
                  defaultValue={editingRole?.name || ""}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  name="description"
                  className="w-full p-2 border rounded-md"
                  defaultValue={editingRole?.description || ""}
                  rows="3"
                />
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
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {editingRole ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar módulos a un rol */}
      {moduleModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Asignar Módulos a {currentRole?.name}</h3>
              <button onClick={() => setModuleModalVisible(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingModules ? (
              <div className="text-center py-4">Cargando módulos...</div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                    {modules.length === 0 ? (
                      <p className="text-gray-500 p-2">No hay módulos disponibles</p>
                    ) : (
                      modules.map((module) => (
                        <div key={module.id} className="flex items-center p-2 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={`module-${module.id}`}
                            checked={selectedModules.includes(module.id)}
                            onChange={() => handleModuleSelection(module.id)}
                            className="mr-2"
                          />
                          <label htmlFor={`module-${module.id}`} className="flex-1">
                            {module.module_name}
                            <span className="text-xs text-gray-500 ml-2">({module.module_key})</span>
                          </label>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${module.is_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {module.is_enabled ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                    onClick={() => setModuleModalVisible(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={handleSubmitModulePermissions}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RolesPage
