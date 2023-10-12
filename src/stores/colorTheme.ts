import { writable } from 'svelte/store';
import type { ColorTheme } from '../models/colorTheme';
import type { SupabaseClient } from '@supabase/supabase-js';

export const theme = writable<ColorTheme[]>([]);

//Create a new instance of the color theme
//test
export const insertData = async (colorThemeObject: ColorTheme, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.from('color_palette').insert(colorThemeObject);

		if (data) {
			theme.update((currentData) => [...(currentData || []), ...data]);
		}

		return data;
	} catch (error) {

		throw error;
	}
};

//Get all data
export const getData = async (supabase: SupabaseClient) => {
	const { data } = await supabase.from('color_palette').select('*').order('id');
	theme.set(data as ColorTheme[]);
	return data as ColorTheme[];
};

// Update data by ID
export const updateData = async (colorThemeObject: ColorTheme, supabase: SupabaseClient) => {

	try {
		const responseData = await supabase
			.from('color_palette')
			.update({ active: null })
			.match({ active: true, mode_type: colorThemeObject.mode_type });
		if (responseData.error) return;
		const { data, error } = await supabase
			.from('color_palette')
			.update(colorThemeObject)
			.match({ id: colorThemeObject.id });
		if (error) {
			throw new Error(error.message);
		}
		getData(supabase);
		return data;
	} catch (error) {

		throw error;
	}
};

// Delete data by ID
export const deleteData = async (id: number, supabase: SupabaseClient) => {
	try {
		const { error } = await supabase.from('color_palette').delete().eq('id', id);

		if (error) {
			throw new Error(error.message);
		}

		theme.update((currentData) => {
			return currentData.filter((item) => item.id !== id);
		});
	} catch (error) {

		throw error;
	}
};
