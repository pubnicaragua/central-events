"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types"
import { MapPin, Globe } from "lucide-react"
import MapModal from "./MapModal"

function LocationSettings({ eventConfig, eventId, supabase, setEventConfig }) {
  const [isOnline, setIsOnline] = useState(false)
  const [locationName, setLocationName] = useState("")
  const [address, setAddress] = useState("")
  const [secondAddress, setSecondAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")
  const [mapUrl, setMapUrl] = useState("") // Nuevo estado para la URL del evento en línea
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Cargar datos de ubicación cuando cambia eventConfig
  useEffect(() => {
    if (eventConfig?.location) {
      const location = eventConfig.location
      setIsOnline(location.is_online || false)
      setLocationName(location.name || "")
      setAddress(location.address || "")
      setSecondAddress(location.second_address || "")
      setCity(location.city || "")
      setState(location.state || "")
      setPostalCode(location.postal_code || "")
      setMapUrl(location.map_url || "") // Cargar la URL del evento en línea

      // Si tenemos country_name, usarlo; de lo contrario, intentar obtener el nombre del país por ID
      if (location.country_name) {
        setCountry(location.country_name)
      } else if (location.country_id) {
        // Aquí podrías tener una función para convertir ID a nombre de país
        // Por ahora, establecemos un valor predeterminado basado en el ID
        const countryNames = {
          1: "España",
          2: "México",
          3: "Estados Unidos",
        }
        setCountry(countryNames[location.country_id] || "")
      }

      setLat(location.lat || null)
      setLng(location.long || null)
    }
  }, [eventConfig])

  // Cargar datos de ubicación si no están en eventConfig pero tenemos locationId
  useEffect(() => {
    const fetchLocationData = async () => {
      // Si ya tenemos los datos de ubicación en eventConfig, no necesitamos hacer la consulta
      if (eventConfig?.location) return

      // Si tenemos un locationId pero no tenemos los datos completos
      if (eventConfig?.location_id && !eventConfig?.location) {
        try {
          setLoading(true)
          const { data, error } = await supabase.from("location").select("*").eq("id", eventConfig.location_id).single()

          if (error) {
            console.error("Error fetching location:", error)
            return
          }

          if (data) {
            setIsOnline(data.is_online || false)
            setLocationName(data.name || "")
            setAddress(data.address || "")
            setSecondAddress(data.second_address || "")
            setCity(data.city || "")
            setState(data.state || "")
            setPostalCode(data.postal_code || "")
            setMapUrl(data.map_url || "") // Cargar la URL del evento en línea

            // Manejar el país como texto
            if (data.country_name) {
              setCountry(data.country_name)
            } else if (data.country_id) {
              // Convertir ID a nombre si es necesario
              const countryNames = {
                1: "España",
                2: "México",
                3: "Estados Unidos",
              }
              setCountry(countryNames[data.country_id] || "")
            }

            setLat(data.lat || null)
            setLng(data.long || null)

            // Actualizar el estado local de eventConfig
            setEventConfig({
              ...eventConfig,
              location: data,
            })
          }
        } catch (error) {
          console.error("Error in fetchLocationData:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLocationData()
  }, [eventConfig, supabase, setEventConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      let locationId = eventConfig?.location_id

      // Preparar los datos para guardar
      const locationData = {
        name: locationName,
        address: isOnline ? "" : address, // Si es online, no necesitamos dirección física
        second_address: isOnline ? "" : secondAddress,
        city: isOnline ? "" : city,
        state: isOnline ? "" : state,
        postal_code: isOnline ? "" : postalCode,
        country_name: isOnline ? "" : country,
        map_url: isOnline ? mapUrl : "", // Guardar la URL solo si es un evento en línea
        is_online: isOnline,
        lat: isOnline ? null : lat, // Si es online, no necesitamos coordenadas
        long: isOnline ? null : lng,
      }

      // Si no existe una ubicación, crear una nueva
      if (!locationId) {
        const { data: newLocation, error: createError } = await supabase
          .from("location")
          .insert(locationData)
          .select()
          .single()

        if (createError) throw createError
        locationId = newLocation.id
      } else {
        // Actualizar la ubicación existente
        const { error: updateError } = await supabase.from("location").update(locationData).eq("id", locationId)

        if (updateError) throw updateError
      }

      // Actualizar o crear la configuración del evento
      if (eventConfig.id) {
        const { error: configError } = await supabase
          .from("event_configs")
          .update({ location_id: locationId })
          .eq("id", eventConfig.id)

        if (configError) throw configError
      } else {
        const { error: configError } = await supabase
          .from("event_configs")
          .insert({ event_id: Number.parseInt(eventId), location_id: locationId })

        if (configError) throw configError
      }

      // Actualizar el estado local
      setEventConfig({
        ...eventConfig,
        location_id: locationId,
        location: {
          id: locationId,
          ...locationData,
        },
      })

      toast.success("Ubicación actualizada")
    } catch (error) {
      console.error("Error updating location:", error)
      toast.error("Error al guardar la ubicación")
    } finally {
      setSaving(false)
    }
  }

  const handleSelectLocation = (location) => {
    setLat(location.lat)
    setLng(location.lng)

    // Si tenemos acceso a la API de Google Maps, intentar obtener la dirección
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addressComponents = results[0].address_components

          // Extraer información de dirección
          let foundAddress = ""
          let foundCity = ""
          let foundState = ""
          let foundPostalCode = ""
          let foundCountry = ""

          addressComponents.forEach((component) => {
            const types = component.types

            if (types.includes("street_number") || types.includes("route")) {
              foundAddress = foundAddress ? `${foundAddress} ${component.long_name}` : component.long_name
            }

            if (types.includes("locality")) {
              foundCity = component.long_name
            }

            if (types.includes("administrative_area_level_1")) {
              foundState = component.long_name
            }

            if (types.includes("postal_code")) {
              foundPostalCode = component.long_name
            }

            if (types.includes("country")) {
              foundCountry = component.long_name
            }
          })

          // Actualizar los campos de dirección si se encontraron
          if (foundAddress) setAddress(foundAddress)
          if (foundCity) setCity(foundCity)
          if (foundState) setState(foundState)
          if (foundPostalCode) setPostalCode(foundPostalCode)
          if (foundCountry) setCountry(foundCountry)
        }
      })
    }

    // Si location.placeData existe (de la búsqueda), usar esa información
    if (location.placeData && location.placeData.address_components) {
      const components = location.placeData.address_components

      let foundAddress = ""
      let foundCity = ""
      let foundState = ""
      let foundPostalCode = ""
      let foundCountry = ""

      components.forEach((component) => {
        const types = component.types

        if (types.includes("street_number") || types.includes("route")) {
          foundAddress = foundAddress ? `${foundAddress} ${component.long_name}` : component.long_name
        }

        if (types.includes("locality")) {
          foundCity = component.long_name
        }

        if (types.includes("administrative_area_level_1")) {
          foundState = component.long_name
        }

        if (types.includes("postal_code")) {
          foundPostalCode = component.long_name
        }

        if (types.includes("country")) {
          foundCountry = component.long_name
        }
      })

      // Actualizar los campos de dirección si se encontraron
      if (foundAddress) setAddress(foundAddress)
      if (foundCity) setCity(foundCity)
      if (foundState) setState(foundState)
      if (foundPostalCode) setPostalCode(foundPostalCode)
      if (foundCountry) setCountry(foundCountry)
    }
  }

  // Validar URL
  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6">Cargando datos de ubicación...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Ubicación</h3>
        <p className="text-sm text-gray-500">Ubicación del evento y detalles del lugar</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="is-online"
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="is-online" className="ml-2 text-sm">
              Este es un evento en línea
            </label>
          </div>

          <div>
            <label htmlFor="location-name" className="block text-sm font-medium mb-1">
              Nombre del lugar
            </label>
            <input
              id="location-name"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder={isOnline ? "Ej: Zoom, Google Meet, etc." : "Ej: Teatro Real"}
            />
          </div>

          {isOnline ? (
            // Mostrar campo de URL para eventos en línea
            <div>
              <label htmlFor="map-url" className="block text-sm font-medium mb-1">
                URL del evento en línea
              </label>
              <div className="flex">
                <div className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                  <Globe size={18} />
                </div>
                <input
                  id="map-url"
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-r-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>
              {mapUrl && !isValidUrl(mapUrl) && (
                <p className="mt-1 text-sm text-red-500">
                  Por favor, ingresa una URL válida (debe comenzar con http:// o https://)
                </p>
              )}
            </div>
          ) : (
            // Mostrar campos de ubicación física para eventos presenciales
            <>
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Dirección Línea 1
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label htmlFor="second-address" className="block text-sm font-medium mb-1">
                  Línea de dirección 2
                </label>
                <input
                  id="second-address"
                  type="text"
                  value={secondAddress}
                  onChange={(e) => setSecondAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    Ciudad
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    Estado o región
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postal-code" className="block text-sm font-medium mb-1">
                    Código postal
                  </label>
                  <input
                    id="postal-code"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1">
                    País
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Ej: España"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium mb-1">
                    Latitud
                  </label>
                  <input
                    id="lat"
                    type="text"
                    value={lat !== null ? lat : ""}
                    onChange={(e) => setLat(Number.parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Ej: 40.416775"
                  />
                </div>

                <div>
                  <label htmlFor="lng" className="block text-sm font-medium mb-1">
                    Longitud
                  </label>
                  <input
                    id="lng"
                    type="text"
                    value={lng !== null ? lng : ""}
                    onChange={(e) => setLng(Number.parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Ej: -3.703790"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 w-full"
                  >
                    <MapPin size={18} />
                    Seleccionar en mapa
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              disabled={saving || (isOnline && mapUrl && !isValidUrl(mapUrl))}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>

      <MapModal
        isOpen={isMapModalOpen && !isOnline}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        initialLat={lat !== null ? lat : undefined}
        initialLng={lng !== null ? lng : undefined}
      />
    </div>
  )
}

export default LocationSettings

LocationSettings.propTypes = {
  eventConfig: PropTypes.object.isRequired,
  eventId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  supabase: PropTypes.object.isRequired,
  setEventConfig: PropTypes.func.isRequired,
}

