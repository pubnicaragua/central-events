"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types";

function NotificationSettings({ eventConfig, eventId, supabase, setEventConfig }) {
  const [supportEmail, setSupportEmail] = useState("")
  const [footerMessage, setFooterMessage] = useState("")
  const [notifyOrganizer, setNotifyOrganizer] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (eventConfig?.notf_config) {
      const notfConfig = eventConfig.notf_config
      setSupportEmail(notfConfig.support_email || "")
      setFooterMessage(notfConfig.message || "")
      setNotifyOrganizer(notfConfig.notificate || false)
    }
  }, [eventConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      let notfConfigId = eventConfig?.notf_config_id

      // Si no existe una configuración de notificaciones, crear una nueva
      if (!notfConfigId) {
        const { data: newNotfConfig, error: createError } = await supabase
          .from("notifications_config")
          .insert({
            support_email: supportEmail,
            message: footerMessage,
            notificate: notifyOrganizer,
          })
          .select()
          .single()

        if (createError) throw createError
        notfConfigId = newNotfConfig.id
      } else {
        // Actualizar la configuración de notificaciones existente
        const { error: updateError } = await supabase
          .from("notifications_config")
          .update({
            support_email: supportEmail,
            message: footerMessage,
            notificate: notifyOrganizer,
          })
          .eq("id", notfConfigId)

        if (updateError) throw updateError
      }

      // Actualizar o crear la configuración del evento
      if (eventConfig.id) {
        const { error: configError } = await supabase
          .from("event_configs")
          .update({ notf_config_id: notfConfigId })
          .eq("id", eventConfig.id)

        if (configError) throw configError
      } else {
        const { error: configError } = await supabase
          .from("event_configs")
          .insert({ event_id: Number.parseInt(eventId), notf_config_id: notfConfigId })

        if (configError) throw configError
      }

      // Actualizar el estado local
      setEventConfig({
        ...eventConfig,
        notf_config_id: notfConfigId,
        notf_config: {
          id: notfConfigId,
          support_email: supportEmail,
          message: footerMessage,
          notificate: notifyOrganizer,
        },
      })

      toast.success("Configuración de notificaciones actualizada")
    } catch (error) {
      console.error("Error updating notification config:", error)
      toast.error("Error al guardar la configuración de notificaciones")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Configuración de correo electrónico y notificaciones</h3>
        <p className="text-sm text-gray-500">
          Personaliza la configuración de correo electrónico y notificaciones para este evento
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="support-email" className="block text-sm font-medium mb-1">
              Correo electrónico de soporte
            </label>
            <input
              id="support-email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="soporte@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="footer-message" className="block text-sm font-medium mb-1">
              Mensaje de pie de página de correo electrónico
            </label>
            <textarea
              id="footer-message"
              value={footerMessage}
              onChange={(e) => setFooterMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              placeholder="Este mensaje se incluirá en el pie de página..."
            />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Configuración de las notificaciones</h4>
            <div className="flex items-center">
              <input
                id="notify-organizer"
                type="checkbox"
                checked={notifyOrganizer}
                onChange={(e) => setNotifyOrganizer(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="notify-organizer" className="ml-2 text-sm">
                Notificar al organizador de nuevos pedidos
              </label>
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

export default NotificationSettings

NotificationSettings.propTypes = {
    eventConfig: PropTypes.func.isRequired,
    eventId: PropTypes.func.isRequired,
    supabase: PropTypes.func.isRequired,
    setEventConfig: PropTypes.func.isRequired,
};
