"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { Search, Send, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateMessageDialog } from "../components/messages/create-message-dialog"
import { MessageCard } from "../components/messages/message-card"
import supabase from "../api/supabase"

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { eventId } = useParams()

  const fetchMessages = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from("messages")
        .select(`
          *,
          attendants (
            id,
            name,
            email
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      if (searchQuery) {
        query = query.or(`topic.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      if (dateFilter !== "all") {
        const today = new Date()
        const startDate = new Date()

        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0)
            break
          case "week":
            startDate.setDate(today.getDate() - 7)
            break
          case "month":
            startDate.setMonth(today.getMonth() - 1)
            break
          default:
            break
        }

        query = query.gte("created_at", startDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }, [dateFilter, eventId, searchQuery])

  useEffect(() => {
    if (eventId) {
      fetchMessages()
    }
  }, [eventId, fetchMessages])

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mensajes</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tema o contenido..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Fecha de Envío" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fechas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Send className="mr-2 h-4 w-4" />
          Enviar Mensaje
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p>Cargando mensajes...</p>
        </div>
      ) : messages.length > 0 ? (
        <div className="grid gap-4">
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-muted p-6">
            <Mail className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No hay mensajes para mostrar</h3>
          <p className="text-muted-foreground">
            Aún no has enviado ningún mensaje. Puede enviar mensajes a todos los asistentes o a poseedores de entradas
            específicas.
          </p>
        </div>
      )}

      <CreateMessageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        eventId={eventId}
        onMessageSent={() => {
          fetchMessages()
        }}
      />
    </div>
  )
}

