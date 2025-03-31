"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types";

function OtherSettings({ eventConfig, eventId, supabase, setEventConfig }) {
  const [includeTax, setIncludeTax] = useState(false)
  const [showHome, setShowHome] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (eventConfig?.other_config) {
      const otherConfig = eventConfig.other_config
      setIncludeTax(otherConfig.include_tax || false)
      setShowHome(otherConfig.show_home || false)
    }
  }, [eventConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      let otherConfigId = eventConfig?.other_config_id

      // Si no existe una configuración adicional, crear una nueva
      if (!otherConfigId) {
        const { data: newOtherConfig, error: createError } = await supabase
          .from("other_config")
          .insert({
            include_tax: includeTax,
            show_home: showHome,
          })
          .select()
          .single()

        if (createError) throw createError
        otherConfigId = newOtherConfig.id
      } else {
        // Actualizar la configuración adicional existente
        const { error: updateError } = await supabase
          .from("other_config")
          .update({
            include_tax: includeTax,
            show_home: showHome,
          })
          .eq("id", otherConfigId)

        if (updateError) throw updateError
      }

      // Actualizar o crear la configuración del evento
      if (eventConfig.id) {
        const { error: configError } = await supabase
          .from("event_configs")
          .update({ other_config_id: otherConfigId })
          .eq("id", eventConfig.id)

        if (configError) throw configError
      } else {
        const { error: configError } = await supabase
          .from("event_configs")
          .insert({ event_id: Number.parseInt(eventId), other_config_id: otherConfigId })

        if (configError) throw configError
      }

      // Actualizar el estado local
      setEventConfig({
        ...eventConfig,
        other_config_id: otherConfigId,
        other_config: {
          id: otherConfigId,
          include_tax: includeTax,
          show_home: showHome,
        },
      })

      toast.success("Otras configuraciones actualizadas")
    } catch (error) {
      console.error("Error updating other config:", error)
      toast.error("Error al guardar otras configuraciones")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Otras configuraciones</h3>
        <p className="text-sm text-gray-500">Personaliza las configuraciones diversas para este evento.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="include-tax"
              type="checkbox"
              checked={includeTax}
              onChange={(e) => setIncludeTax(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="include-tax" className="ml-2 text-sm">
              Incluir impuestos en el precio
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="show-home"
              type="checkbox"
              checked={showHome}
              onChange={(e) => setShowHome(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="show-home" className="ml-2 text-sm">
              Mostrar página de inicio
            </label>
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

export default OtherSettings

OtherSettings.propTypes = {
    eventConfig: PropTypes.func.isRequired,
    eventId: PropTypes.func.isRequired,
    supabase: PropTypes.func.isRequired,
    setEventConfig: PropTypes.func.isRequired,
};
