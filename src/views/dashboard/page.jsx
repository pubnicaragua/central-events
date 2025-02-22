"use client"

import { useParams } from "react-router-dom"
import { DashboardPage } from "../../components/dashboard/dashboard-page"   

export default function DashboardRoute() {
  const { eventId } = useParams()
  return <DashboardPage eventId={eventId} />
}

