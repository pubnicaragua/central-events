"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOrganizer, getCurrencies, getTimezones } from "../utils/supabaseActions"

export function OrganizerForm({ onSubmit }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currencyId, setCurrencyId] = useState("")
  const [timezoneId, setTimezoneId] = useState("")
  const [currencies, setCurrencies] = useState([])
  const [timezones, setTimezones] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [selectedTimezone, setSelectedTimezone] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const currenciesData = await getCurrencies()
      const timezonesData = await getTimezones()
      setCurrencies(currenciesData)
      setTimezones(timezonesData)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const organizer = await createOrganizer(name, email, currencyId, timezoneId)
      onSubmit(organizer)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleCurrencyChange = (value) => {
    setCurrencyId(value)
    const selected = currencies.find((currency) => currency.id.toString() === value)
    setSelectedCurrency(selected)
  }

  const handleTimezoneChange = (value) => {
    setTimezoneId(value)
    const selected = timezones.find((timezone) => timezone.id.toString() === value)
    setSelectedTimezone(selected)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nombre del organizador <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Impresionante organizador Ltd."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Divisa <span className="text-red-500">*</span>
          </label>
          <Select onValueChange={handleCurrencyChange} value={currencyId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una divisa">
                {selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.code})` : "Selecciona una divisa"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.id.toString()}>
                  {currency.name} ({currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">La moneda predeterminada para tus eventos.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Zona horaria <span className="text-red-500">*</span>
          </label>
          <Select onValueChange={handleTimezoneChange} value={timezoneId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una zona horaria">
                {selectedTimezone
                  ? `${selectedTimezone.name} (${selectedTimezone.utc})`
                  : "Selecciona una zona horaria"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timezones.map((timezone) => (
                <SelectItem key={timezone.id} value={timezone.id.toString()}>
                  {timezone.name} ({timezone.utc})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">La zona horaria predeterminada para sus eventos.</p>
        </div>
      </div>

      <Button type="submit" className="w-full bg-black hover:bg-black">
        Crear organizador
      </Button>
    </form>
  )
}

OrganizerForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

