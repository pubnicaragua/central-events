"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types";


function PaymentSettings({ eventConfig, eventId, supabase, setEventConfig }) {
  const [prePayMsg, setPrePayMsg] = useState("")
  const [postPayMsg, setPostPayMsg] = useState("")
  const [waitingTime, setWaitingTime] = useState(15)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (eventConfig?.pay_config) {
      const payConfig = eventConfig.pay_config
      setPrePayMsg(payConfig.pre_pay_msg || "")
      setPostPayMsg(payConfig.post_pay_msg || "")
      setWaitingTime(payConfig.waiting_time || 15)
    }
  }, [eventConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      let payConfigId = eventConfig?.pay_config_id

      // Si no existe una configuración de pago, crear una nueva
      if (!payConfigId) {
        const { data: newPayConfig, error: createError } = await supabase
          .from("payment_config")
          .insert({
            pre_pay_msg: prePayMsg,
            post_pay_msg: postPayMsg,
            waiting_time: waitingTime,
          })
          .select()
          .single()

        if (createError) throw createError
        payConfigId = newPayConfig.id
      } else {
        // Actualizar la configuración de pago existente
        const { error: updateError } = await supabase
          .from("payment_config")
          .update({
            pre_pay_msg: prePayMsg,
            post_pay_msg: postPayMsg,
            waiting_time: waitingTime,
          })
          .eq("id", payConfigId)

        if (updateError) throw updateError
      }

      // Actualizar o crear la configuración del evento
      if (eventConfig.id) {
        const { error: configError } = await supabase
          .from("event_configs")
          .update({ pay_config_id: payConfigId })
          .eq("id", eventConfig.id)

        if (configError) throw configError
      } else {
        const { error: configError } = await supabase
          .from("event_configs")
          .insert({ event_id: Number.parseInt(eventId), pay_config_id: payConfigId })

        if (configError) throw configError
      }

      // Actualizar el estado local
      setEventConfig({
        ...eventConfig,
        pay_config_id: payConfigId,
        pay_config: {
          id: payConfigId,
          pre_pay_msg: prePayMsg,
          post_pay_msg: postPayMsg,
          waiting_time: waitingTime,
        },
      })

      toast.success("Configuración de pago actualizada")
    } catch (error) {
      console.error("Error updating payment config:", error)
      toast.error("Error al guardar la configuración de pago")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Configuración de pago</h3>
        <p className="text-sm text-gray-500">Personaliza la página de pago del evento.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="pre-pay-msg" className="block text-sm font-medium mb-1">
              Mensaje previo al pago
            </label>
            <textarea
              id="pre-pay-msg"
              value={prePayMsg}
              onChange={(e) => setPrePayMsg(e.target.value)}
              placeholder="Mensaje antes de pagar..."
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
            />
          </div>

          <div>
            <label htmlFor="post-pay-msg" className="block text-sm font-medium mb-1">
              Mensaje posterior al pago
            </label>
            <textarea
              id="post-pay-msg"
              value={postPayMsg}
              onChange={(e) => setPostPayMsg(e.target.value)}
              placeholder="Mensaje después del pago..."
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
            />
          </div>

          <div>
            <label htmlFor="waiting-time" className="block text-sm font-medium mb-1">
              Tiempo de espera del pedido
            </label>
            <input
              id="waiting-time"
              type="number"
              value={waitingTime}
              onChange={(e) => setWaitingTime(Number.parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border rounded-md"
            />
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

export default PaymentSettings

PaymentSettings.propTypes = {
    eventConfig: PropTypes.func.isRequired,
    eventId: PropTypes.func.isRequired,
    supabase: PropTypes.func.isRequired,
    setEventConfig: PropTypes.func.isRequired,
};
