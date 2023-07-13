import { writable } from 'svelte/store';
import type { PageData } from '../models/pageType';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageEnum } from '../models/pageEnum';

export const pageTheme = writable<PageData[]>([]);

//Create a new instance of the color pageTheme
export const insertPageData = async (PageTypeObject: PageData, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.from('page_builder').insert(PageTypeObject);

		// console.log(data);
		pageTheme.update((currentData) => {
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

export const fetchPageData = async (pageName: PageEnum, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.from('page_builder').select('*').eq('page', pageName);
		if (error) {
			console.error('Error fetching page data:', error.message);
			return;
		}

		// console.log('/////////??????', data);

		pageTheme.set(data || []);
	} catch (error) {
		console.error(error);
		throw error;
	}
};
