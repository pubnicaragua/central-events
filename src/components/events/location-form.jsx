import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getEventLocation, updateLocation, createLocation, getCountries } from "../../utils/locationActions";

export function LocationForm() {
  const { eventId } = useParams();
  const [locationData, setLocationData] = useState({
    name: "",
    address: "",
    second_address: "",
    city: "",
    state: "",
    postal_code: "",
    country_id: "",
    map_url: "",
    is_online: false,
  });
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState(null);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    async function fetchLocationAndCountries() {
      try {
        //obtener paises
        const countryList = await getCountries();
        setCountries(countryList);

        // Step 1: Fetch `location_id` from `event_configs`
        const location = await getEventLocation(eventId);

        if (location) {
          setLocationId(location.id);
          setLocationData(location);
        } else {
          console.warn("No location assigned to this event.");
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setError("Failed to load location data");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchLocationAndCountries();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocationData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (locationId) {
        await updateLocation(locationId, locationData);
      } else {
        await createLocation(locationData);
      }
      alert("Ubicación guardada exitosamente!");
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error al guardar la ubicación");
    }
  };

  if (loading) return <div>Cargando ubicación...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación</CardTitle>
        <CardDescription>Ubicación del evento y detalles del lugar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center space-x-2">
            <Switch id="is_online" checked={locationData.is_online} onCheckedChange={(checked) => handleInputChange({ target: { name: "is_online", type: "checkbox", checked } })} />
            <Label htmlFor="is_online">Este es un evento en línea</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del lugar</Label>
            <Input id="name" name="name" value={locationData.name} onChange={handleInputChange} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección Línea 1</Label>
              <Input id="address" name="address" value={locationData.address} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="second_address">Línea de dirección 2</Label>
              <Input id="second_address" name="second_address" value={locationData.second_address} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" value={locationData.city} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado o región</Label>
              <Input id="state" name="state" value={locationData.state} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postal_code">CP o Código Postal</Label>
              <Input id="postal_code" name="postal_code" value={locationData.postal_code} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country_id">País</Label>
              <Select
                name="country_id"
                value={locationData.country_id}
                onValueChange={(value) => setLocationData({ ...locationData, country_id: value })}
              >
                <SelectTrigger id="country_id">
                  <SelectValue placeholder="Selecciona un país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.length > 0 ? (
                    countries.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>No hay países disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="map_url">URL de mapas personalizados</Label>
            <Input id="map_url" name="map_url" value={locationData.map_url} onChange={handleInputChange} />
            <p className="text-sm text-muted-foreground">Si está en blanco, la dirección se utilizará para generar un enlace al mapa de Google.</p>
          </div>

          <Button type="submit">Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
