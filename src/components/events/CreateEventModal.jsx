"use client"

import { useState, useEffect } from "react"
import { X, Calendar, User, Clock, FileText, Loader } from "lucide-react"
import PropTypes from "prop-types"
import supabase from "../../api/supabase"

function CreateEventModal({ onClose, onSubmit }) {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    organizer_id: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Próximo",
  })

  useEffect(() => {
    fetchOrganizers()
  }, [])

  async function fetchOrganizers() {
    setLoading(true)
    setError(null)
    try {
      // Primero, obtener el ID del rol de organizador
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "organizador")
        .single()

      if (roleError) throw roleError

      if (!roleData) {
        throw new Error("No se encontró el rol de organizador")
      }

      // Obtener usuarios con rol de organizador
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role_id", roleData.id)

      if (userRolesError) throw userRolesError

      if (userRolesData && userRolesData.length > 0) {
        // Extraer los IDs de usuario
        const userIds = userRolesData.map((item) => item.user_id)

        // Obtener los perfiles de usuario
        const { data: usersData, error: usersError } = await supabase
          .from("user_profile")
          .select("*")
          .in("auth_id", userIds)

        if (usersError) throw usersError

        // Formatear los datos para el select
        const organizerUsers = usersData.map((user) => ({
          id: user.auth_id,
          name: user.name || "Sin nombre",
          email: user.email,
        }))

        setOrganizers(organizerUsers)
      } else {
        setOrganizers([])
      }
    } catch (err) {
      console.error("Error al obtener organizadores:", err)
      setError("No se pudieron cargar los organizadores. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.organizer_id) {
      errors.organizer_id = "Debes seleccionar un organizador"
    }

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "El nombre del evento es obligatorio"
    }

    if (!formData.start_date) {
      errors.start_date = "La fecha de inicio es obligatoria"
    }

    if (!formData.end_date) {
      errors.end_date = "La fecha final es obligatoria"
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)

      if (endDate < startDate) {
        errors.end_date = "La fecha final debe ser posterior a la fecha de inicio"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      setError("Ocurrió un error al crear el evento. Por favor, intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const retryLoadOrganizers = () => {
    fetchOrganizers()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100">
        <div className="flex justify-between items-center p-6 border-b border-emerald-100 bg-emerald-50">
          <h2 className="text-2xl font-bold text-emerald-900 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-emerald-700" />
            Crear evento
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-emerald-100 transition-colors text-emerald-700"
            aria-label="Cerrar"
          >
            <X size="24" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-emerald-600" />
              Organizador <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                name="organizer_id"
                value={formData.organizer_id}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.organizer_id ? "border-red-500" : "border-emerald-200"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm`}
                required
                disabled={loading}
              >
                <option value="">Selecciona un organizador</option>
                {organizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.email})
                  </option>
                ))}
              </select>
            </div>
            {loading && (
              <p className="text-sm text-emerald-600 mt-2 flex items-center">
                <span className="animate-pulse mr-2">●</span> Cargando organizadores...
              </p>
            )}
            {!loading && organizers.length === 0 && !error && (
              <p className="text-sm text-amber-600 mt-2">
                No se encontraron organizadores.
                <button
                  type="button"
                  onClick={retryLoadOrganizers}
                  className="ml-2 text-emerald-600 hover:text-emerald-800 underline"
                >
                  Reintentar
                </button>
              </p>
            )}
            {formErrors.organizer_id && <p className="text-sm text-red-600 mt-1">{formErrors.organizer_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
              Nombre del evento <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Conferencia Anual 2025"
              className={`w-full p-3 border ${
                formErrors.name ? "border-red-500" : "border-emerald-200"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm`}
              required
            />
            {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-emerald-600" />
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu evento..."
              className="w-full p-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-h-[120px] resize-y bg-white shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                Fecha de inicio <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.start_date ? "border-red-500" : "border-emerald-200"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm`}
                required
              />
              {formErrors.start_date && <p className="text-sm text-red-600 mt-1">{formErrors.start_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                Fecha final <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  formErrors.end_date ? "border-red-500" : "border-emerald-200"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm`}
                required
              />
              {formErrors.end_date && <p className="text-sm text-red-600 mt-1">{formErrors.end_date}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-emerald-800 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium text-base disabled:bg-emerald-400 disabled:cursor-not-allowed shadow-md"
              disabled={submitting || loading}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  Creando evento...
                </span>
              ) : (
                "Continuar configuración del evento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEventModal

CreateEventModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
