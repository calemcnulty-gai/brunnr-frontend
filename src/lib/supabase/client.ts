/**
 * @fileoverview Supabase client for browser/client-side usage
 * @module supabase/client
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Creates a Supabase client for client-side usage
 * @param rememberMe - Whether to use persistent storage (30 days) or session storage
 * @returns Supabase browser client instance
 */
export function createClient(rememberMe?: boolean) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log("Creating Supabase client", { 
    url: url ? `${url.substring(0, 20)}...` : 'undefined',
    key: key ? `${key.substring(0, 20)}...` : 'undefined',
    domain: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });
  
  if (!url || !key) {
    const error = "Supabase environment variables are not set. Please check your .env.local file.";
    console.error(error, { url: !!url, key: !!key });
    throw new Error(error);
  }
  
  return createBrowserClient<Database>(url, key, {
    auth: {
      storage: rememberMe ? 
        {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          },
        } : 
        {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.sessionStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem(key);
            }
          },
        },
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}
