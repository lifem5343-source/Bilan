import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | null = null;

// Client Supabase du navigateur, créé à la demande. N'utilise que la clé publique.
export function clientNavigateur(): SupabaseClient {
  if (!instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !cle) throw new Error("Variables Supabase publiques manquantes");
    instance = createClient(url, cle);
  }
  return instance;
}
