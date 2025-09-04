/**
 * @fileoverview Supabase client for browser/client-side usage
 * @module supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Creates a Supabase client for client-side usage
 * @returns Supabase browser client instance
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error(
      "Supabase environment variables are not set. Please check your .env.local file."
    );
  }
  
  return createBrowserClient<Database>(url, key);
}
