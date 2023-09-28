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

		// 
		about.update((currentData) => {
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

//Get all about data
export const getData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('about')
			.select('*,about_languages(*)')
			.order('created_at', { ascending: false });

		about.set(data as AboutModel[]);
	} catch (error) {

		throw error;
	}
};

//update about by id
export const updateData = async (
	aboutObject: AboutModel,
	aboutDataLang: AboutModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_about_and_about_lang', {
			about_data: aboutObject,
			about_lang_data: aboutDataLang
		});

		if (error) {
			throw error;
		}

		about.update((currentAbout) => {
			if (data) {
				// Find the index of the updated item
				const index = currentAbout.findIndex((item) => item.id === aboutObject.id);

				// Create a new array with the updated item
				const updatedAbout = [
					...currentAbout.slice(0, index),
					data,
					...currentAbout.slice(index + 1)
				];

				return updatedAbout;
			}

			return currentAbout;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
