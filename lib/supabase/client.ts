"use client";

import { createClient } from "@supabase/supabase-js";

import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createClient> | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

