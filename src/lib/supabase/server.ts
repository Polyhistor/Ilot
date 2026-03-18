import { createClient } from '@supabase/supabase-js'

// Creates a fresh client per request for server components
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
