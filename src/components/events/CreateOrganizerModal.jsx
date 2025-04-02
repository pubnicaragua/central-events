"use client"

import { useState, useEffect } from "react"
import { XIcon } from "../../components/Icons"
import supabase from "../../api/supabase"
import PropTypes from "prop-types"

function CreateOrganizerModal({ onClose, onSubmit }) {
  const [currencies, setCurrencies] = useState([])
  const [timezones, setTimezones] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currency_id: "",
    timezone_id: "",
  })

  useEffect(() => {
    fetchCurrencies()
    fetchTimezones()
  }, [])

  async function fetchCurrencies() {
    const { data, error } = await supabase.from("currencies").select("*")
    if (error) {
      console.error("Error fetching currencies:", error)
    } else {
      setCurrencies(data || [])
    }
  }

  async function fetchTimezones() {
    const { data, error } = await supabase.from("timezones").select("*")
    if (error) {
      console.error("Error fetching timezones:", error)
    } else {
      setTimezones(data || [])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Crear organizador</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del organizador <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Impresionante organizador Ltd."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Divisa <span className="text-red-500">*</span>
              </label>
              <select
                name="currency_id"
                value={formData.currency_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una divisa</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">La moneda predeterminada para tus eventos.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona horaria <span className="text-red-500">*</span>
              </label>
              <select
                name="timezone_id"
                value={formData.timezone_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una zona horaria</option>
                {timezones.map((timezone) => (
                  <option key={timezone.id} value={timezone.id}>
                    {timezone.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">La zona horaria predeterminada para sus eventos.</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Crear organizador
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateOrganizerModal

CreateOrganizerModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

