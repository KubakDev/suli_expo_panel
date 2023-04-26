// src/routes/+layout.ts

import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  const supabase = createSupabaseLoadClient({
    supabaseUrl: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();
  console.log("layout", session)
  return { supabase, session };
};