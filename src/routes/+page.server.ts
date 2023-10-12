// import type { Actions } from './$types';
// import { fail, redirect } from '@sveltejs/kit';
// import { AuthApiError } from '@supabase/supabase-js';

import { AuthApiError } from '@supabase/supabase-js';
import { fail, json, redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */

export const actions = {
	signout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	}
};
