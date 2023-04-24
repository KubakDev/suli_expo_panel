// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  const user = await getSession()
  if (!user) {
    throw redirect(303, "/");
  }
  return {
    session: await getSession()
  };
};