// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { supabase } from '../../supabase';
export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  let session = await getSession();
  // if (!session) throw redirect(303, '/');
  return {
    session: session
  };
};