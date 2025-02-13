"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { OrganizerForm } from "@/components/organizer-form"
import { EventForm } from "@/components/event-form"

export default function WelcomePage() {
  const [organizerCreated, setOrganizerCreated] = useState(false)
  const [organizerId, setOrganizerId] = useState(null)

  const handleOrganizerSubmit = (organizer) => {
    setOrganizerId(organizer.id)
    setOrganizerCreated(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {!organizerCreated ? (
          <Card className="mx-auto max-w-3xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Comencemos creando tu primer organizador.</h3>
              <p className="text-gray-600">Un organizador es la empresa o persona que organiza el evento.</p>
            </div>

            <OrganizerForm onSubmit={handleOrganizerSubmit} />
          </Card>
        ) : (
          <Card className="mx-auto max-w-3xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Ahora creemos tu primer evento.</h3>
              <p className="text-gray-600">
                Un evento es el evento real que estás organizando. Puedes agregar más detalles más adelante.
              </p>
            </div>

            <EventForm organizerId={organizerId} />

            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Salta este paso
              </a>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

