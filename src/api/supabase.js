
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://beckfiitgbfzrkrmkrro.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlY2tmaWl0Z2JmenJrcm1rcnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODMxNzIsImV4cCI6MjA1NDk1OTE3Mn0.XNVBOWP5WywfcddLjtsbDUi_f-RR4M0ij1MKg2D-Wqg';

// Inicializar el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; // Cambiar a export default