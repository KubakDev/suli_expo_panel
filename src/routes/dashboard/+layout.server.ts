// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { supabase } from '../../supabase';
export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {

  const user = await getSession()
  getSession().then((res) => {
    console.log(res)
  })
  // if (!user) {
  //   throw redirect(303, "/");
  // }
  return {
    session: await getSession()
  };
};