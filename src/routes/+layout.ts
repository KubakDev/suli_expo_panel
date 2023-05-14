// src/routes/+layout.ts

import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { supabaseStore } from '../stores/supabaseStore';
export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  const supabase = createSupabaseLoadClient({
    supabaseUrl: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session
  });
  supabaseStore.set(supabase);

  const {
    data: { session }
  } = await supabase.auth.getSession();
  return { supabase, session };
};

