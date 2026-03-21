import { createClient } from '@supabase/supabase-js';

// TODO: Reemplazar con las credenciales reales de Supabase desde las variables de entorno (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey);
