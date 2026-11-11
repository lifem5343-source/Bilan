import { createClient } from "@supabase/supabase-js";

// Client Supabase à droits complets : à n'utiliser QUE côté serveur (webhook).
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) {
    throw new Error("Variables Supabase manquantes");
  }
  return createClient(url, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
