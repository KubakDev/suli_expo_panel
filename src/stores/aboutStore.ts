import { writable } from 'svelte/store';
import type { AboutModel, AboutModelLang } from '../models/aboutModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const about = writable<AboutModel[]>([]);

//Create a new instance of the about
export const insertData = async (
	aboutObject: AboutModel,
	aboutDataLang: AboutModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_about_and_about_lang', {
			about_data: aboutObject,
			about_lang_data: aboutDataLang
		});

		// console.log(data);
		about.update((currentData) => {
			if (data) {
				return [...(currentData || []), ...data];
			}
			return currentData || [];
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
