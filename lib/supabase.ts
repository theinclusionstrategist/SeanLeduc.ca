import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Administrative Supabase client (bypasses RLS in secure server-side routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
