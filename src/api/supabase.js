
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

// Inicializar el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; // Cambiar a export default