// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import { page } from '$app/stores';

import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals: { getSession }, request }) => {
  let session = await getSession();
  const path = new URL(request.url).pathname;
  console.log(session);
  console.log('###############')
  

  if (!session && !path.includes("login")) throw redirect(303, '/login');
  if (session && !path.includes("dashboard")) throw redirect(303, '/dashboard/news');
  return {
    session: session
  };
};