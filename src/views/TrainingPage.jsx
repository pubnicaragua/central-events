"use client"

import { useState } from "react"
import VideoCard from "../components/training/VideoCard"
import VideoPlayer from "../components/training/VideoPlayer"

// Datos estáticos de los videos
const trainingVideos = [
  {
    id: "1BJHBjnEkQS6QLLbOTJHUzxLn_-WwZELx",
    title: "Introducción a la Plataforma",
    description: "Aprende los conceptos básicos para comenzar a utilizar nuestra plataforma de eventos.",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "10k0ezzs01kJuNtmxAyzxi8uS04uxM58b",
    title: "Gestión de Asistentes",
    description: "Descubre cómo administrar eficientemente los asistentes a tus eventos.",
    thumbnail: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "1BJHBjnEkQS6QLLbOTJHUzxLn_-WwZELx", // Duplicado para tener más contenido
    title: "Configuración de Eventos",
    description: "Tutorial completo sobre cómo configurar eventos desde cero.",
    thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop",
  },
  {
    id: "10k0ezzs01kJuNtmxAyzxi8uS04uxM58b", // Duplicado para tener más contenido
    title: "Personalización de Tickets",
    description: "Aprende a crear y personalizar tickets para tus eventos.",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
  },
]

const TrainingPage = () => {
  const [activeVideo, setActiveVideo] = useState(null)

  const handlePlayVideo = (videoId) => {
    setActiveVideo(videoId)
  }

  const handleCloseVideo = () => {
    setActiveVideo(null)
  }

  return (
    <div className="p-6 bg-emerald-50">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-700">Módulo de Capacitación</h2>
          </div>

          <div className="mb-8">
            <p className="text-gray-600">
              Bienvenido al modulo de capacitación. Aquí encontrarás videos tutoriales para ayudarte a sacar el máximo
              provecho de la plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingVideos.map((video) => (
              <VideoCard
                key={`${video.id}-${video.title}`}
                title={video.title}
                description={video.description}
                thumbnail={video.thumbnail}
                videoId={video.id}
                onPlay={handlePlayVideo}
              />
            ))}
          </div>
        </div>
      </div>

      {activeVideo && <VideoPlayer videoId={activeVideo} onClose={handleCloseVideo} />}
    </div>
  )
}

export default TrainingPage
