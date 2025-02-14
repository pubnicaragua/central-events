"use client"

import { useState } from "react"
import { useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react"
import { BasicDetailsForm } from "./basic-details-form"
import { LocationForm } from "./location-form"
import { PaymentSettingsForm } from "./payment-settings-form"
import { SeoSettingsForm } from "./seo-settings-form"
import { EmailSettingsForm } from "./email-settings-form"
import { OtherSettingsForm } from "./other-settings-form"

export default function EventSettings() {
  const params = useParams();
  const eventId = params?.eventId || null; // ✅ Asegurar que `eventId` sea válido

  const [eventData] = useState({
    name: "Nuevo Evento",
    status: "DRAFT - PRÓXIMO",
  })

  if (!eventId) {
    return <div className="text-red-500">Error: No se encontró el evento.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-2">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Eventos</span>
        <ChevronRight className="h-4 w-4" />
        <span>Organizador</span>
        <ChevronRight className="h-4 w-4" />
        <span>{eventData.name}</span>
        <span className="rounded bg-muted px-2 py-1 text-xs">{eventData.status}</span>
      </div>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>

        <div className="space-y-6">
          <BasicDetailsForm />
          <LocationForm eventId={eventId} /> {/* ✅ Pasar eventId como prop */}
          <PaymentSettingsForm eventId={eventId} /> {/* ✅ Pasar eventId como prop */}
          <SeoSettingsForm eventId={eventId} /> {/* ✅ Ahora eventId siempre será válido */}
          <EmailSettingsForm eventId={eventId} />
          <OtherSettingsForm eventId={eventId} />
        </div>
      </div>
    </div>
  )
}

