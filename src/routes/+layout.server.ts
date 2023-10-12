// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import { page } from '$app/stores';

import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals: { getSession, supabase }, request }) => {
	let session = await getSession();
	//
	const path = new URL(request.url).pathname;
	await supabase.from('admin_users').select('*').eq('uid', session?.user.id).then(async (res) => {
		if (!res.data || res.data.length < 1) {
			await supabase.auth.signOut();
			if (path.includes('dashboard')) {
				throw redirect(303, '/login');
			}
		}

	});
	if (!session && !path.includes('login')) throw redirect(303, '/login');
	if (session && !path.includes('dashboard')) throw redirect(303, '/dashboard');
	return {
		session: session
	};
};
