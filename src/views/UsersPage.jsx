"use client"

import { useState, useEffect } from "react"
import supabase from "../api/supabase"
import { UserPlus, Edit, Trash2, Key, Save } from "lucide-react"

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchUserRoles()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Obtener usuarios de user_profile
      const { data: profileUsers, error: profileError } = await supabase.from("user_profile").select("*")

      if (profileError) throw profileError
      setUsers(profileUsers || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      alert("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase.from("roles").select("*")

      if (error) throw error
      setRoles(data || [])
    } catch (error) {
      console.error("Error fetching roles:", error)
      alert("Error al cargar roles")
    }
  }

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase.from("user_roles").select("*")

      if (error) throw error
      setUserRoles(data || [])
    } catch (error) {
      console.error("Error fetching user roles:", error)
      alert("Error al cargar roles de usuarios")
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setModalVisible(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setModalVisible(true)
  }

  const handleDeleteUser = async (userId, authId) => {
    try {
      // Primero eliminar registros relacionados
      await supabase.from("user_roles").delete().eq("user_id", userId)

      // Luego eliminar el perfil de usuario
      const { error: profileError } = await supabase.from("user_profile").delete().eq("id", userId)

      if (profileError) throw profileError

      // Nota: La eliminación del usuario de auth.users debe hacerse a través de una función segura en el servidor
      // ya que requiere permisos administrativos de Supabase
      if (authId) {
        // Esta parte requeriría una función serverless o un endpoint seguro
        console.log("Se debería eliminar el usuario de auth.users con ID:", authId)
      }

      alert("Usuario eliminado correctamente")
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error al eliminar usuario")
    }
  }

  const handleManageRoles = (user) => {
    setCurrentUser(user)
    setRoleModalVisible(true)
  }

  // Modificar la función handleSubmitUser para usar el UUID correcto
  const handleSubmitUser = async (values) => {
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from("user_profile")
          .update({
            name: values.name,
            second_name: values.second_name,
            email: values.email,
          })
          .eq("id", editingUser.id)

        if (error) throw error
        alert("Usuario actualizado correctamente")
      } else {
        // Crear nuevo usuario
        // 1. Crear usuario en auth.users mediante signUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        })

        if (authError) throw authError

        console.log("Usuario auth creado:", authData.user)

        // Esperar un momento para asegurar que el usuario se ha creado en auth.users
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 2. Crear perfil de usuario
        const { data: profileData, error: profileError } = await supabase
          .from("user_profile")
          .insert({
            name: values.name,
            second_name: values.second_name,
            email: values.email,
            auth_id: authData.user.id,
          })
          .select()

        if (profileError) {
          console.error("Error al crear perfil:", profileError)
          throw profileError
        }

        console.log("Perfil creado:", profileData)

        // 3. Asignar roles si se especificaron
        if (values.roles && values.roles.length > 0 && profileData && profileData[0]) {
          // Usar el auth_id (UUID) como user_id en la tabla user_roles
          const rolesToInsert = values.roles.map((roleId) => ({
            user_id: authData.user.id, // Usar el UUID de auth.users
            role_id: Number.parseInt(roleId, 10), // Convertir a número
          }))

          console.log("Roles a insertar:", rolesToInsert)

          const { error: rolesError } = await supabase.from("user_roles").insert(rolesToInsert)

          if (rolesError) {
            console.error("Error al asignar roles:", rolesError)
            throw rolesError
          }
        }

        alert("Usuario creado correctamente")
      }

      setModalVisible(false)
      fetchUsers()
      fetchUserRoles()
    } catch (error) {
      console.error("Error saving user:", error)
      alert(`Error al guardar usuario: ${error.message}`)
    }
  }

  const handleSubmitRoles = async (values) => {
    try {
      if (!currentUser) return

      // Eliminar roles actuales del usuario
      await supabase.from("user_roles").delete().eq("user_id", currentUser.auth_id)

      // Asignar nuevos roles
      if (values.roles && values.roles.length > 0) {
        const rolesToInsert = values.roles.map((roleId) => ({
          user_id: currentUser.auth_id, // Usar el UUID de auth.users
          role_id: Number.parseInt(roleId, 10), // Convertir a número
        }))

        console.log("Roles a actualizar:", rolesToInsert)

        const { error } = await supabase.from("user_roles").insert(rolesToInsert)

        if (error) throw error
      }

      alert("Roles asignados correctamente")
      setRoleModalVisible(false)
      fetchUserRoles()
    } catch (error) {
      console.error("Error assigning roles:", error)
      alert("Error al asignar roles")
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
          <div className="flex justify-end mb-4">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleCreateUser}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Crear Usuario
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border-b">Nombre</th>
                  <th className="text-left p-3 border-b">Apellido</th>
                  <th className="text-left p-3 border-b">Email</th>
                  <th className="text-left p-3 border-b">Roles</th>
                  <th className="text-left p-3 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center">
                      Cargando...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center">
                      No hay usuarios disponibles
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{user.name}</td>
                      <td className="p-3 border-b">{user.second_name}</td>
                      <td className="p-3 border-b">{user.email}</td>
                      <td className="p-3 border-b">
                        {userRoles
                          .filter((ur) => ur.user_id === user.auth_id)
                          .map((ur) => {
                            const role = roles.find((r) => r.id === ur.role_id)
                            return role ? role.name : "Desconocido"
                          })
                          .join(", ") || "Sin roles"}
                      </td>
                      <td className="p-3 border-b">
                        <div className="flex space-x-2">
                          <button
                            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </button>
                          <button
                            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            onClick={() => handleManageRoles(user)}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            Roles
                          </button>
                          <button
                            className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            onClick={() => {
                              if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
                                handleDeleteUser(user.id, user.auth_id)
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
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingUser ? "Editar Usuario" : "Crear Usuario"}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const values = {
                  name: formData.get("name"),
                  second_name: formData.get("second_name"),
                  email: formData.get("email"),
                  password: formData.get("password"),
                  roles: Array.from(formData.getAll("roles")),
                }
                handleSubmitUser(values)
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  name="name"
                  className="w-full p-2 border rounded-md"
                  defaultValue={editingUser?.name || ""}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <input
                  name="second_name"
                  className="w-full p-2 border rounded-md"
                  defaultValue={editingUser?.second_name || ""}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full p-2 border rounded-md"
                  defaultValue={editingUser?.email || ""}
                  required
                />
              </div>

              {!editingUser && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Contraseña</label>
                    <input name="password" type="password" className="w-full p-2 border rounded-md" required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Roles</label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {roles.map((role) => (
                        <div key={role.id} className="flex items-center p-2 hover:bg-gray-50">
                          <input type="checkbox" id={`role-${role.id}`} name="roles" value={role.id} className="mr-2" />
                          <label htmlFor={`role-${role.id}`}>{role.name}</label>
                        </div>
                      ))}
                      {roles.length === 0 && <p className="text-gray-500 p-2">No hay roles disponibles</p>}
                    </div>
                  </div>
                </>
              )}

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
                  {editingUser ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar roles */}
      {roleModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Asignar Roles a {currentUser?.name}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const selectedRoles = Array.from(formData.getAll("roles"))
                handleSubmitRoles({ roles: selectedRoles })
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Roles</label>
                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                  {roles.map((role) => {
                    const isSelected = userRoles.some(
                      (ur) => ur.user_id === currentUser?.auth_id && ur.role_id === role.id,
                    )

                    return (
                      <div key={role.id} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`user-role-${role.id}`}
                          name="roles"
                          value={role.id}
                          defaultChecked={isSelected}
                          className="mr-2"
                        />
                        <label htmlFor={`user-role-${role.id}`}>{role.name}</label>
                      </div>
                    )
                  })}
                  {roles.length === 0 && <p className="text-gray-500 p-2">No hay roles disponibles</p>}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={() => setRoleModalVisible(false)}
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
    </div>
  )
}

export default UsersPage

