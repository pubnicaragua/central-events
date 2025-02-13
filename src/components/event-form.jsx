"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createEvent } from "../utils/supabaseActions"

export function EventForm({ organizerId }) {
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createEvent(organizerId, name, startDate, endDate, "draft")
      // Aquí puedes manejar la respuesta, por ejemplo, redirigir al usuario o mostrar un mensaje de éxito
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Nombre <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="El primer evento de Super Producciones"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Fecha final <span className="text-red-500">*</span>
          </label>
          <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
      </div>

      <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
        Crear evento
      </Button>
    </form>
  )
}

EventForm.propTypes = {
  organizerId: PropTypes.number.isRequired,
}

