import { useEffect, useState } from "react";
import supabase from "../api/supabase"; // Conexión a Supabase

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };
    getUser();
  }, []);

  return { isAuthenticated: !!user, user };
}
