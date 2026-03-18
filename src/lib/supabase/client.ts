import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Server-only singleton. Import only in server components, lib/db/*, and API routes.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)
