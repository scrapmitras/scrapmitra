import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://caaivmxrksnrarknvanj.supabase.co'
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_HPZSSf1LkN9SvU24dofwFg_Uy6z4pEF'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

