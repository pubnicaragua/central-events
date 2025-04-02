"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types";

function BasicDetails({ event, eventId, supabase }) {
  const [name, setName] = useState(event?.name || "")
  const [description, setDescription] = useState(event?.description || "")
  const [startDate, setStartDate] = useState(
    event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "",
  )
  const [endDate, setEndDate] = useState(event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      const { error } = await supabase
        .from("events")
        .update({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
        })
        .eq("id", eventId)

      if (error) throw error

      toast.success("Detalles básicos actualizados")
    } catch (error) {
      console.error("Error updating event:", error)
      toast.error("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Detalles básicos</h3>
        <p className="text-sm text-gray-500">Actualizar el nombre del evento, la descripción y las fechas.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium mb-1">
                Fecha de inicio <span className="text-red-500">*</span>
              </label>
              <input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium mb-1">
                Fecha final <span className="text-red-500">*</span>
              </label>
              <input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BasicDetails

BasicDetails.propTypes = {
    event: PropTypes.func.isRequired,
    eventId: PropTypes.func.isRequired,
    supabase: PropTypes.func.isRequired,
};
