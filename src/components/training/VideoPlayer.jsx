"use client"

import { X } from "lucide-react"

const VideoPlayer = ({ videoId, onClose }) => {
  // Convertir el ID de Google Drive a una URL embebible
  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 focus:outline-none"
        >
          <X className="h-8 w-8" />
        </button>

        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-t-lg"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title="Video player"
          ></iframe>
        </div>

        <div className="p-4 border-t">
          <p className="text-sm text-gray-500">
            Si el video no se reproduce correctamente, puedes
            <a
              href={`https://drive.google.com/file/d/${videoId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 ml-1"
            >
              abrirlo directamente en Google Drive
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
