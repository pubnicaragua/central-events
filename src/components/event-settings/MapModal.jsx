"use client"

import { useState, useEffect, useCallback } from "react"
import PropTypes from "prop-types"
import { X } from "lucide-react"

// Definir la clave de API directamente como constante
// Nota: En producción, es mejor usar variables de entorno
const GOOGLE_MAPS_API_KEY = "AIzaSyC-BA-7oTyLAxz4dXapvVLM3SdK5KdZVcQ"

function MapModal({ isOpen, onClose, onSelectLocation, initialLat, initialLng }) {
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat || 40.416775, // Default to Madrid, Spain if no coordinates
    lng: initialLng || -3.70379,
  })
  const [mapError, setMapError] = useState(null)

  // Actualizar la ubicación seleccionada cuando cambian las props
  useEffect(() => {
    if (initialLat && initialLng) {
      setSelectedLocation({
        lat: initialLat,
        lng: initialLng,
      })
    }
  }, [initialLat, initialLng])

  // Initialize map
  useEffect(() => {
    if (!isOpen) return

    // Load Google Maps API script
    const googleMapsApiKey = GOOGLE_MAPS_API_KEY

    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`
      script.async = true
      script.defer = true
      script.onload = () => {
        // Cargar la API de Places por separado para evitar errores
        const placesScript = document.createElement("script")
        placesScript.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initPlacesCallback`
        placesScript.async = true
        placesScript.defer = true
        document.head.appendChild(placesScript)

        // Definir la función de callback global
        window.initPlacesCallback = () => {
          initMap()
        }
      }
      script.onerror = () => {
        setMapError("Error al cargar la API de Google Maps")
      }
      document.head.appendChild(script)

      return () => {
        // Limpiar scripts y callback global
        if (window.initPlacesCallback) {
          delete window.initPlacesCallback
        }
        const scriptElements = document.querySelectorAll('script[src*="maps.googleapis.com/maps/api"]')
        scriptElements.forEach((el) => {
          if (document.head.contains(el)) {
            document.head.removeChild(el)
          }
        })
      }
    } else {
      initMap()
    }
  }, [isOpen])

  const initMap = useCallback(() => {
    if (!window.google || !isOpen) return

    try {
      const mapOptions = {
        center: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      }

      const newMap = new window.google.maps.Map(document.getElementById("google-map"), mapOptions)
      setMap(newMap)

      const newMarker = new window.google.maps.Marker({
        position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        map: newMap,
        draggable: true,
        title: "Ubicación del evento",
      })
      setMarker(newMarker)

      // Add click event to map
      newMap.addListener("click", (e) => {
        const clickedLocation = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        }
        newMarker.setPosition(clickedLocation)
        setSelectedLocation(clickedLocation)
      })

      // Add dragend event to marker
      newMarker.addListener("dragend", () => {
        const position = newMarker.getPosition()
        setSelectedLocation({
          lat: position.lat(),
          lng: position.lng(),
        })
      })

      // Implementar búsqueda manual sin depender de Places API
      const input = document.getElementById("map-search-input")
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          const searchText = input.value

          // Usar Geocoding API en lugar de Places API
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ address: searchText }, (results, status) => {
            if (status === "OK" && results[0]) {
              const location = results[0].geometry.location

              // Centrar mapa y mover marcador
              newMap.setCenter(location)
              newMap.setZoom(17)
              newMarker.setPosition(location)

              // Actualizar ubicación seleccionada
              const newLocation = {
                lat: location.lat(),
                lng: location.lng(),
                placeData: results[0],
              }
              setSelectedLocation(newLocation)
            } else {
              console.error("Geocoding error:", status)
              alert("No se pudo encontrar la ubicación. Intenta con otra búsqueda.")
            }
          })
        }
      })
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapError("Error al inicializar el mapa: " + error.message)
    }
  }, [isOpen, selectedLocation.lat, selectedLocation.lng])

  const handleConfirm = () => {
    // Si tenemos datos de lugar de la búsqueda, incluirlos en la respuesta
    const locationData = { ...selectedLocation }

    onSelectLocation(locationData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">Seleccionar ubicación en el mapa</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b">
          <input
            id="map-search-input"
            type="text"
            placeholder="Buscar ubicación... (presiona Enter para buscar)"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex-grow relative">
          {mapError ? (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
              <p className="text-red-500">{mapError}</p>
            </div>
          ) : (
            <div id="google-map" className="w-full h-[400px]"></div>
          )}
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div>
            <p className="text-sm">
              <strong>Latitud:</strong> {selectedLocation.lat.toFixed(6)}
            </p>
            <p className="text-sm">
              <strong>Longitud:</strong> {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Cancelar
            </button>
            <button onClick={handleConfirm} className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700">
              Confirmar ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

MapModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectLocation: PropTypes.func.isRequired,
  initialLat: PropTypes.number,
  initialLng: PropTypes.number,
}

export default MapModal

