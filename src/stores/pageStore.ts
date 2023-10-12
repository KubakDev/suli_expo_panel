import { writable } from 'svelte/store';
import type { PageData } from '../models/pageType';
import type { PageEnum } from '../models/pageEnum';
import type { SupabaseClient } from '@supabase/supabase-js';

export const pageTheme = writable<PageData>();
export const selectedTheme = writable<any>();

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

		if (data) {
			pageTheme.update((currentData) => {
				const updatedIndex = currentData.findIndex((item) => item.id === updatedPageData.id);
				if (updatedIndex !== -1) {
					const newData = [...currentData];
					newData[updatedIndex] = updatedPageData;
					return newData;
				}
				return currentData || [];
			});
		}

		return data;
	} catch (error) {

		throw error;
	}
};

//Get all data
export async function getPageData(pageName: PageEnum, supabase: any) {
	const result = await supabase
		.from('page_builder')
		.select(
			`
    *,
    color_palette_light:color_palette_id_lightMode(*),
    color_palette_dark:color_palette_id_darkMode(*),
    component_type(*),
    component(*)
  `
		)
		.eq('page', pageName)
		.single();

	pageTheme.set(result.data);
	// 

	if (result) {
		// Update the pageData store with the fetched data
		selectedTheme.set(result.data.color_palette_light);
		pageTheme.set(result.data);
	}
}

export async function changeComponentType(newCardData: PageData) {
	pageTheme.set(newCardData);
}

export async function changeTheme(newThemeData: PageData) {
	pageTheme.set(newThemeData);
}

export async function changeCurrentTheme(currentTheme: PageData) {
	selectedTheme.set(currentTheme);
}
