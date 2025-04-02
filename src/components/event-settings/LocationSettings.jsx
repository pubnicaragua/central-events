"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types";

function LocationSettings({ eventConfig, eventId, supabase, setEventConfig }) {
  const [isOnline, setIsOnline] = useState(false)
  const [locationName, setLocationName] = useState("")
  const [address, setAddress] = useState("")
  const [secondAddress, setSecondAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryId, setCountryId] = useState(1) // Default country ID
  const [saving, setSaving] = useState(false)

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
      setCountryId(location.country_id || 1)
    }
  }, [eventConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      let locationId = eventConfig?.location_id

      // Si no existe una ubicación, crear una nueva
      if (!locationId) {
        const { data: newLocation, error: createError } = await supabase
          .from("location")
          .insert({
            name: locationName,
            address,
            second_address: secondAddress,
            city,
            state,
            postal_code: postalCode,
            country_id: countryId,
            is_online: isOnline,
          })
          .select()
          .single()

        if (createError) throw createError
        locationId = newLocation.id
      } else {
        // Actualizar la ubicación existente
        const { error: updateError } = await supabase
          .from("location")
          .update({
            name: locationName,
            address,
            second_address: secondAddress,
            city,
            state,
            postal_code: postalCode,
            country_id: countryId,
            is_online: isOnline,
          })
          .eq("id", locationId)

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
          name: locationName,
          address,
          second_address: secondAddress,
          city,
          state,
          postal_code: postalCode,
          country_id: countryId,
          is_online: isOnline,
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
            />
          </div>

          {!isOnline && (
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
                  <select
                    id="country"
                    value={countryId}
                    onChange={(e) => setCountryId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value={1}>España</option>
                    <option value={2}>México</option>
                    <option value={3}>Estados Unidos</option>
                    {/* Agregar más países según sea necesario */}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LocationSettings

LocationSettings.propTypes = {
    eventConfig: PropTypes.func.isRequired,
    eventId: PropTypes.func.isRequired,
    supabase: PropTypes.func.isRequired,
    setEventConfig: PropTypes.func.isRequired,
};
