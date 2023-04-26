// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  const user = await getSession()
  console.log("in home", user)
  return {
    session: await getSession()
  };
};