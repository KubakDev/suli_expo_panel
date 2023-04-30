// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  let session = await getSession();
  // if (!session) throw redirect(303, '/');
  return {
    session: session
  };
};