// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import { page } from '$app/stores';

import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals: { getSession }, request }) => {
  let session = await getSession();
  const path = new URL(request.url).pathname;

  if (session?.expires_in && session.expires_in < 1000) {
    session = null;
  }

  if (!session && !path.includes("login")) throw redirect(303, '/login');
  if (session && !path.includes("dashboard")) throw redirect(303, '/dashboard/news');
  return {
    session: session
  };
};