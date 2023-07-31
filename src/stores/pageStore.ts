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

//update page Data by id
export const updatePageData = async (pageName: PageEnum, supabase: SupabaseClient) => {
	try {
		console.log('first');
		const { data, error } = await supabase
			.from('page_builder')
			.update('page_builder')
			.eq('page', pageName);

		if (error) {
			throw error;
		}

		pageTheme.update((currentData) => {
			if (data) {
				// Find the index of the updated item
				const index = currentData.findIndex((item) => item.id === PageDataID.id);

				// Create a new array with the updated item
				const updatedData = [...currentData.slice(0, index), data, ...currentData.slice(index + 1)];

				return updatedData;
			}

			return currentData;
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
