"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

export function AttendeeForm({ attendee, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: attendee?.name || "",
    email: attendee?.email || "",
    second_name: attendee?.second_name || "",
    code: attendee?.code || "",
    status: attendee?.status || "confirmed",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="second_name">Apellido</Label>
          <Input id="second_name" name="second_name" value={formData.second_name} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Código de referencia</Label>
        <Input id="code" name="code" value={formData.code} onChange={handleChange} />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : attendee ? "Actualizar" : "Crear"}
        </Button>
      </DialogFooter>
    </form>
  )
}

