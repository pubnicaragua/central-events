"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AttendeeForm } from "./attendee-form"
import supabase from "../../api/supabase"

export function EditAttendeeDialog({ open, onOpenChange, attendee, onAttendeeUpdated }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("attendants")
        .update({
          name: formData.name,
          second_name: formData.second_name,
          email: formData.email,
          code: formData.code,
        })
        .eq("id", attendee.id)

      if (error) throw error

      onAttendeeUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating attendee:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar asistente</DialogTitle>
        </DialogHeader>
        <AttendeeForm attendee={attendee} onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}

