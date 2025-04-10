"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { XIcon } from "lucide-react"
import PropTypes from "prop-types"

function CreateTicketModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [ticketType, setTicketType] = useState("")
  const [ticketData, setTicketData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    start_date: "",
    end_date: "",
    hide_before_sale_start: false,
    hide_after_sale_end: false,
    hide_when_sold_out: false,
    show_available_quantity: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para manejar los niveles de precio para tickets escalonados
  const [levels, setLevels] = useState([])
  const [newLevel, setNewLevel] = useState({
    level_name: "",
    price: "",
    quantity: "",
    tag: "",
  })

  const handleTicketTypeSelect = (type) => {
    setTicketType(type)
    setStep(2)

    // Resetear el precio según el tipo de ticket
    if (type === "GRATIS") {
      setTicketData({ ...ticketData, price: 0 })
    } else {
      setTicketData({ ...ticketData, price: "" })
    }
  }

  const handleQuantityTypeChange = (isUnlimited) => {
    if (isUnlimited) {
      setTicketData({ ...ticketData, quantity: 0 })
    } else {
      setTicketData({ ...ticketData, quantity: "" })
    }
  }

  // Función para añadir un nivel de precio
  const handleAddLevel = () => {
    if (!newLevel.level_name || !newLevel.price) {
      toast.error("El nombre y el precio del nivel son obligatorios")
      return
    }

    setLevels([
      ...levels,
      {
        ...newLevel,
        id: Date.now(), // ID temporal para identificar el nivel
        price: Number.parseFloat(newLevel.price) || 0,
        quantity: newLevel.quantity === "" ? null : Number.parseInt(newLevel.quantity),
      },
    ])

    setNewLevel({
      level_name: "",
      price: "",
      quantity: "",
      tag: "",
    })
  }

  // Función para eliminar un nivel de precio
  const handleRemoveLevel = (levelId) => {
    setLevels(levels.filter((level) => level.id !== levelId))
  }

  // Modificar la función handleSubmit para depurar y asegurar que los niveles se envían correctamente
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Validar datos según el tipo de ticket
      if (
        ticketType !== "GRATIS" &&
        ticketType !== "ESCALONADO" &&
        (!ticketData.price || Number.parseFloat(ticketData.price) < 0)
      ) {
        toast.error("Por favor, ingresa un precio válido")
        return
      }

      if (ticketData.quantity !== 0 && (!ticketData.quantity || Number.parseInt(ticketData.quantity) <= 0)) {
        toast.error("Por favor, ingresa una cantidad válida o selecciona ilimitado")
        return
      }

      // Para tickets escalonados, verificar que haya al menos un nivel
      if (ticketType === "ESCALONADO" && levels.length === 0) {
        toast.error("Debes agregar al menos un nivel de precio")
        return
      }

      // Crear el objeto de datos del ticket
      const ticketToSubmit = {
        ...ticketData,
        ticket_type: ticketType,
        price: ticketType === "ESCALONADO" ? 0 : Number.parseFloat(ticketData.price) || 0,
        quantity: Number.parseInt(ticketData.quantity) || 0,
      }

      // Si es un ticket escalonado, añadir los niveles
      if (ticketType === "ESCALONADO") {
        ticketToSubmit.levels = levels
      }

      console.log("Enviando ticket:", ticketToSubmit)

      const result = await onSubmit(ticketToSubmit)

      if (result.success) {
        toast.success("Ticket creado correctamente")
        onClose()
      } else {
        toast.error(result.error?.message || "Error al crear el ticket")
      }
    } catch (error) {
      console.error("Error submitting ticket:", error)
      toast.error("Error al crear el ticket: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crear Ticket</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XIcon width={24} height={24} />
              </button>
            </div>

            {step === 1 ? (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${
                      ticketType === "PAGADO" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTicketTypeSelect("PAGADO")}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          ticketType === "PAGADO" ? "border-green-500" : "border-gray-300"
                        } flex items-center justify-center mr-2`}
                      >
                        {ticketType === "PAGADO" && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                      </div>
                      <h4 className="font-medium">Boleto pagado</h4>
                    </div>
                    <p className="text-sm text-gray-500">Billete estándar con precio fijo.</p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${
                      ticketType === "GRATIS" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTicketTypeSelect("GRATIS")}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          ticketType === "GRATIS" ? "border-green-500" : "border-gray-300"
                        } flex items-center justify-center mr-2`}
                      >
                        {ticketType === "GRATIS" && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                      </div>
                      <h4 className="font-medium">Boleto gratis</h4>
                    </div>
                    <p className="text-sm text-gray-500">Entrada gratuita, no se requiere información de pago.</p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${
                      ticketType === "DONACION"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTicketTypeSelect("DONACION")}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          ticketType === "DONACION" ? "border-green-500" : "border-gray-300"
                        } flex items-center justify-center mr-2`}
                      >
                        {ticketType === "DONACION" && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                      </div>
                      <h4 className="font-medium">Donación / Pague la entrada que desee</h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      Fijar un precio mínimo y dejar que los usuarios paguen más si lo desean.
                    </p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${
                      ticketType === "ESCALONADO"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTicketTypeSelect("ESCALONADO")}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          ticketType === "ESCALONADO" ? "border-green-500" : "border-gray-300"
                        } flex items-center justify-center mr-2`}
                      >
                        {ticketType === "ESCALONADO" && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                      </div>
                      <h4 className="font-medium">Boleto escalonado</h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      Múltiples opciones de precios. Perfecto para entradas anticipadas, etc.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={ticketData.name}
                      onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                      required
                      placeholder="Entrada VIP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      value={ticketData.description}
                      onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                      placeholder="Descripción del ticket"
                      rows={3}
                    />
                  </div>

                  {ticketType !== "GRATIS" && ticketType !== "ESCALONADO" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {ticketType === "DONACION" ? "Precio mínimo" : "Precio"}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full pl-8 pr-3 py-2 border rounded-md"
                          value={ticketData.price}
                          onChange={(e) => setTicketData({ ...ticketData, price: e.target.value })}
                          required={ticketType !== "GRATIS"}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad disponible</label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 border rounded-md appearance-none"
                        value={ticketData.quantity === 0 ? "unlimited" : "limited"}
                        onChange={(e) => handleQuantityTypeChange(e.target.value === "unlimited")}
                      >
                        <option value="unlimited">Ilimitado</option>
                        <option value="limited">Cantidad específica</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>

                    {ticketData.quantity !== 0 && (
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border rounded-md mt-2"
                        value={ticketData.quantity}
                        onChange={(e) => setTicketData({ ...ticketData, quantity: e.target.value })}
                        required={ticketData.quantity !== 0}
                        placeholder="Cantidad"
                      />
                    )}
                  </div>

                  {ticketType === "ESCALONADO" && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Niveles de precio</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nombre del nivel</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.level_name}
                            onChange={(e) => setNewLevel({ ...newLevel, level_name: e.target.value })}
                            placeholder="Ej: Early Bird"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Precio</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full pl-8 pr-3 py-2 border rounded-md"
                              value={newLevel.price}
                              onChange={(e) => setNewLevel({ ...newLevel, price: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Cantidad (opcional)</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.quantity}
                            onChange={(e) => setNewLevel({ ...newLevel, quantity: e.target.value })}
                            placeholder="Dejar vacío para ilimitado"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Etiqueta (opcional)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            value={newLevel.tag}
                            onChange={(e) => setNewLevel({ ...newLevel, tag: e.target.value })}
                            placeholder="Ej: Promoción"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddLevel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mb-4"
                      >
                        Añadir nivel
                      </button>

                      {levels.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium mb-2">Niveles añadidos</h4>
                          <div className="bg-gray-50 rounded-md p-2">
                            {levels.map((level) => (
                              <div
                                key={level.id}
                                className="flex justify-between items-center py-2 border-b last:border-0"
                              >
                                <div>
                                  <span className="font-medium">{level.level_name}</span>
                                  <span className="ml-2 text-gray-600">${level.price.toFixed(2)}</span>
                                  {level.quantity && (
                                    <span className="ml-2 text-gray-500">({level.quantity} disponibles)</span>
                                  )}
                                  {level.tag && (
                                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                      {level.tag}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLevel(level.id)}
                                  className="text-black hover:text-gray-700"
                                >
                                  Eliminar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de inicio de la venta
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border rounded-md"
                        value={ticketData.start_date}
                        onChange={(e) => setTicketData({ ...ticketData, start_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de finalización de la venta
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border rounded-md"
                        value={ticketData.end_date}
                        onChange={(e) => setTicketData({ ...ticketData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="hide-before"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 rounded"
                        checked={ticketData.hide_before_sale_start}
                        onChange={(e) => setTicketData({ ...ticketData, hide_before_sale_start: e.target.checked })}
                      />
                      <label htmlFor="hide-before" className="ml-2 text-sm text-gray-700">
                        Ocultar boleto antes de la fecha de inicio de venta
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="hide-after"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 rounded"
                        checked={ticketData.hide_after_sale_end}
                        onChange={(e) => setTicketData({ ...ticketData, hide_after_sale_end: e.target.checked })}
                      />
                      <label htmlFor="hide-after" className="ml-2 text-sm text-gray-700">
                        Ocultar boleto después de la fecha de finalización de la venta
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="hide-sold-out"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 rounded"
                        checked={ticketData.hide_when_sold_out}
                        onChange={(e) => setTicketData({ ...ticketData, hide_when_sold_out: e.target.checked })}
                      />
                      <label htmlFor="hide-sold-out" className="ml-2 text-sm text-gray-700">
                        Ocultar entrada cuando esté agotada
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="show-quantity"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 rounded"
                        checked={ticketData.show_available_quantity}
                        onChange={(e) => setTicketData({ ...ticketData, show_available_quantity: e.target.checked })}
                      />
                      <label htmlFor="show-quantity" className="ml-2 text-sm text-gray-700">
                        Mostrar cantidad de entradas disponibles
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 1 ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Cancelar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creando..." : "Crear Ticket"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setStep(1)}
                >
                  Atrás
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

CreateTicketModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
}

export default CreateTicketModal
