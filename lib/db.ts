import { createClient } from '@supabase/supabase-js';

// Este cliente está destinado únicamente al uso del lado del servidor.
// No lo uses en componentes de cliente.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar que las variables de entorno estén definidas
if (!supabaseUrl) {
  throw new Error('Supabase URL is not defined. Please add NEXT_PUBLIC_SUPABASE_URL to your environment variables.');
}
if (!supabaseServiceKey) {
  throw new Error('Supabase service role key is not defined. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables.');
}

// Crear y exportar el cliente de Supabase para el lado del servidor
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;
