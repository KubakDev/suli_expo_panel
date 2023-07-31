import { writable } from 'svelte/store';
import type { PageData } from '../models/pageType';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageEnum } from '../models/pageEnum';

export const pageTheme = writable<PageData[]>([]);

// insert data into this page
export const insertPageData = async (PageTypeObject: PageData, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.from('page_builder').insert(PageTypeObject);

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

// update data
export const updatePageData = async (updatedPageData: PageData, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('page_builder')
			.update(updatedPageData)
			.eq('id', updatedPageData.id);
		console.log('Data before update:', data);
		pageTheme.update((currentData) => {
			if (data) {
				const updatedIndex = currentData.findIndex((item) => item.id === updatedPageData.id);
				if (updatedIndex !== -1) {
					const newData = [...currentData];
					newData[updatedIndex] = updatedPageData;
					return newData;
				}
			}
			return currentData || [];
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
