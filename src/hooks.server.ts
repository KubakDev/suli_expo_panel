// src/hooks.server.ts

import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { supabase } from "./supabase"
export const handle: Handle = async ({ event, resolve }) => {


  event.locals.getSession = async () => {

    const {
      data: { session }
    } = await supabase.auth.getSession();
    console.log("hoooks", session)
    return session;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
};