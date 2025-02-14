import supabase from "../api/supabase"

export async function getLocations() {
  try {
    const { data, error } = await supabase.from("location").select("*")

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching locations:", error)
    throw error
  }
}

export async function getCountries() {
  try {
    const { data, error } = await supabase.from("countries").select("*");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}


export async function getEventLocation(eventId) {
  try {
    // 🔹 Step 1: Fetch `location_id` from `event_configs`
    const { data: configData, error: configError } = await supabase
      .from("event_configs")
      .select("location_id")
      .eq("event_id", eventId)
      .maybeSingle(); // ✅ Use maybeSingle() to avoid error
      console.log(configData)
    if (configError) throw configError;
    if (!configData?.location_id) return null; // No location assigned

    // 🔹 Step 2: Fetch location data using `location_id`
    const { data: locationData, error: locationError } = await supabase
      .from("location")
      .select("*")
      .eq("id", configData.location_id)
      .maybeSingle(); // ✅ Use maybeSingle() here too

    
    if (locationError) throw locationError;

    return locationData;
  } catch (error) {
    console.error("Error fetching location data:", error);
    throw error;
  }
}


export async function getLocationById(id) {
  try {
    const { data, error } = await supabase.from("location").select("*").eq("id", id).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching location:", error)
    throw error
  }
}

export async function createLocation(locationData) {
  try {
    const { data, error } = await supabase.from("location").insert([locationData]).select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Error creating location:", error)
    throw error
  }
}

export async function updateLocation(id, locationData) {
  try {
    const { data, error } = await supabase.from("location").update(locationData).eq("id", id).select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Error updating location:", error)
    throw error
  }
}

export async function deleteLocation(id) {
  try {
    const { error } = await supabase.from("location").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting location:", error)
    throw error
  }
}

