"use client"
import { Play } from "lucide-react"

const VideoCard = ({ title, description, thumbnail, videoId, onPlay }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
            <div className="relative">
                <img src={thumbnail || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
                <button
                    onClick={() => onPlay(videoId)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                </button>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>
        </div>
    )
}

export default VideoCard
