"use client"

import { useState, useEffect } from "react"
import supabase from "../api/supabase"
import { Plus, Edit, Trash2, AppWindow, Save } from "lucide-react"

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
  const [modulePermissions, setModulePermissions] = useState([])

  // Estados para la creación de módulos
  const [moduleCreationVisible, setModuleCreationVisible] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [activeTab, setActiveTab] = useState("roles")

  useEffect(() => {
    fetchRoles()
    fetchModules()
    fetchModulePermissions()
  }, [])

  // Funciones para roles
  const fetchRoles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("roles").select("*")

      console.log(data)
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
      const { data, error } = await supabase.from("modules").select("*")

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error("Error fetching modules:", error)
      alert("Error al cargar módulos")
    }
  }

  const fetchModulePermissions = async () => {
    try {
      const { data, error } = await supabase.from("modules_permission").select("*")

      if (error) throw error
      setModulePermissions(data || [])
    } catch (error) {
      console.error("Error fetching module permissions:", error)
      alert("Error al cargar permisos de módulos")
    }
  }

  const handleManageModules = (role) => {
    setCurrentRole(role)
    setModuleModalVisible(true)
  }

  const handleSubmitModules = async (values) => {
    try {
      if (!currentRole) return

      // Eliminar permisos actuales del rol
      await supabase.from("modules_permission").delete().eq("role_id", currentRole.id)

      // Asignar nuevos módulos
      if (values.modules && values.modules.length > 0) {
        const permissionsToInsert = values.modules.map((moduleId) => ({
          module_id: moduleId,
        }))

        const { error } = await supabase.from("modules_permission").insert(permissionsToInsert)

        if (error) throw error
      }

      alert("Módulos asignados correctamente")
      setModuleModalVisible(false)
      fetchModulePermissions()
    } catch (error) {
      console.error("Error assigning modules:", error)
      alert("Error al asignar módulos")
    }
  }

  // Funciones para la creación y gestión de módulos
  const handleCreateModule = () => {
    setEditingModule(null)
    setModuleCreationVisible(true)
  }

  const handleEditModule = (module) => {
    setEditingModule(module)
    setModuleCreationVisible(true)
  }

  const handleDeleteModule = async (moduleId) => {
    try {
      // Verificar si hay permisos asociados a este módulo
      const { data: permissions, error: checkError } = await supabase
        .from("modules_permission")
        .select("id")
        .eq("module_id", moduleId)

      if (checkError) throw checkError

      // Eliminar permisos asociados
      if (permissions && permissions.length > 0) {
        await supabase.from("modules_permission").delete().eq("module_id", moduleId)
      }

      // Eliminar el módulo
      const { error } = await supabase.from("modules").delete().eq("id", moduleId)

      if (error) throw error

      alert("Módulo eliminado correctamente")
      fetchModules()
    } catch (error) {
      console.error("Error deleting module:", error)
      alert("Error al eliminar módulo")
    }
  }

  const handleSubmitModuleCreation = async (values) => {
    try {
      if (editingModule) {
        // Actualizar módulo existente
        const { error } = await supabase
          .from("modules")
          .update({
            module_name: values.module_name,
          })
          .eq("id", editingModule.id)

        if (error) throw error
        alert("Módulo actualizado correctamente")
      } else {
        // Crear nuevo módulo
        const { error } = await supabase.from("modules").insert({
          module_name: values.module_name,
        })

        if (error) throw error
        alert("Módulo creado correctamente")
      }

      setModuleCreationVisible(false)
      fetchModules()
    } catch (error) {
      console.error("Error saving module:", error)
      alert("Error al guardar módulo")
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Gestión de Roles y Módulos</h2>

          {/* Tabs */}
          <div className="border-b mb-4">
            <div className="flex">
              <button
                className={`py-2 px-4 font-medium ${activeTab === "roles" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("roles")}
              >
                Roles
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === "modules" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                onClick={() => setActiveTab("modules")}
              >
                Módulos
              </button>
            </div>
          </div>

          {/* Roles Tab */}
          {activeTab === "roles" && (
            <>
              <div className="flex justify-end mb-4">
                <button
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleCreateRole}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Crear Rol
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 border-b">Nombre</th>
                      <th className="text-left p-3 border-b">Descripción</th>
                      <th className="text-left p-3 border-b">Módulos</th>
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
                    ) : roles.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-3 text-center">
                          No hay roles disponibles
                        </td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="p-3 border-b">{role.name}</td>
                          <td className="p-3 border-b">{role.description}</td>
                          <td className="p-3 border-b">
                            {modulePermissions
                              .filter((mp) => mp.role_id === role.id)
                              .map((mp) => {
                                const module = modules.find((m) => m.id === mp.module_id)
                                return module ? module.module_name : "Desconocido"
                              })
                              .join(", ") || "Sin módulos"}
                          </td>
                          <td className="p-3 border-b">
                            <div className="flex space-x-2">
                              <button
                                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                onClick={() => handleEditRole(role)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </button>
                              <button
                                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                onClick={() => handleManageModules(role)}
                              >
                                <AppWindow className="h-4 w-4 mr-1" />
                                Módulos
                              </button>
                              <button
                                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                onClick={() => {
                                  if (window.confirm("¿Estás seguro de eliminar este rol?")) {
                                    handleDeleteRole(role.id)
                                  }
                                }}
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
            </>
          )}

          {/* Modules Tab */}
          {activeTab === "modules" && (
            <>
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
                      <th className="text-left p-3 border-b">Nombre del Módulo</th>
                      <th className="text-left p-3 border-b">Rol Asociado</th>
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
                    ) : modules.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-3 text-center">
                          No hay módulos disponibles
                        </td>
                      </tr>
                    ) : (
                      modules.map((module) => (
                        <tr key={module.id} className="hover:bg-gray-50">
                          <td className="p-3 border-b">{module.module_name}</td>
                          <td className="p-3 border-b">
                            {roles.find((r) => r.id === module.role_id)?.name || "Sin rol asociado"}
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
                                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                onClick={() => {
                                  if (window.confirm("¿Estás seguro de eliminar este módulo?")) {
                                    handleDeleteModule(module.id)
                                  }
                                }}
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
            </>
          )}
        </div>
      </div>

      {/* Modal para crear/editar rol */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingRole ? "Editar Rol" : "Crear Rol"}</h3>
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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
            <h3 className="text-xl font-bold mb-4">Asignar Módulos a {currentRole?.name}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const selectedModules = Array.from(formData.getAll("modules"))
                handleSubmitModules({ modules: selectedModules })
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Módulos</label>
                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                  {modules.map((module) => {
                    const isSelected = modulePermissions.some(
                      (mp) => mp.role_id === currentRole?.id && mp.module_id === module.id,
                    )

                    return (
                      <div key={module.id} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`module-${module.id}`}
                          name="modules"
                          value={module.id}
                          defaultChecked={isSelected}
                          className="mr-2"
                        />
                        <label htmlFor={`module-${module.id}`}>{module.module_name}</label>
                      </div>
                    )
                  })}
                  {modules.length === 0 && <p className="text-gray-500 p-2">No hay módulos disponibles</p>}
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
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear/editar módulo */}
      {moduleCreationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingModule ? "Editar Módulo" : "Crear Módulo"}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                handleSubmitModuleCreation({
                  module_name: formData.get("module_name"),
                  role_id: formData.get("role_id") || null,
                })
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre del Módulo</label>
                <input
                  name="module_name"
                  className="w-full p-2 border rounded-md"
                  defaultValue={editingModule?.module_name || ""}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={() => setModuleCreationVisible(false)}
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

export default RolesPage

