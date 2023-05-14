// src/hooks.server.ts

import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    event
  });
  event.locals.getSession = async () => {
    let {
      data: { session }
    } = await event.locals.supabase.auth.getSession();

    if (session?.expires_in && session.expires_in < 1000) {
      const authResponse = await event.locals.supabase.auth.refreshSession(session)
      session = authResponse.data.session;
    }
    return session;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
};