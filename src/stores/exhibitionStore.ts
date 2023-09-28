import { writable } from 'svelte/store';
import type { ExhibitionsModel, ExhibitionsModelLang } from '../models/exhibitionModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import { exhibition } from './exhibitionTypeStore';

export const exhibitions = writable<ExhibitionsModel[]>([]);

//Create a new instance of the exhibition
export const insertData = async (
	exhibitionObject: ExhibitionsModel,
	exhibitionDataLang: ExhibitionsModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_exhibition_and_exhibition_lang', {
			exhibition_data: exhibitionObject,
			exhibition_lang_data: exhibitionDataLang
		});

		exhibitions.update((currentData) => {
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

//Get all exhibition data
export const getData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('exhibition')
			.select('*,exhibition_languages(*)')
			.or('deleted_status.is.null') // Filter rows with deleted_status false or null
			.order('position', { ascending: true });

		exhibitions.set(data ?? []);
	} catch (error) {

		throw error;
	}
};

//delete exhibition by id
// export const deleteData = async (exhibitionId: number, supabase: SupabaseClient) => {
// 	try {
// 		const { data, error } = await supabase.rpc('delete_exhibition_and_exhibition_lang', {
// 			data: { id: exhibitionId }
// 		});

// 		if (error) {
// 			throw error;
// 		}

// 		exhibitions.update((currentExhibition) => {
// 			if (data) {
// 				return currentExhibition.filter((item) => item.id !== exhibitionId);
// 			}
// 			return currentExhibition;
// 		});

// 		return data;
// 	} catch (error) {
// 		
// 		throw error;
// 	}
// };

//update exhibition by id
export const updateData = async (
	exhibitionObject: ExhibitionsModel,
	exhibitionDataLang: ExhibitionsModelLang[],
	supabase: SupabaseClient
) => {
	try {
		// 
		const { data, error } = await supabase.rpc('update_exhibition_and_exhibition_lang', {
			exhibition_data: exhibitionObject,
			exhibition_lang_data: exhibitionDataLang
		});

		if (error) {
			throw error;
		}

		exhibitions.update((currentExhibition) => {
			if (data) {
				// Find the index of the updated item
				const index = currentExhibition.findIndex((item) => item.id === exhibitionObject.id);

				// Create a new array with the updated item
				const updatedExhibition = [
					...currentExhibition.slice(0, index),
					data,
					...currentExhibition.slice(index + 1)
				];

				return updatedExhibition;
			}

			return currentExhibition;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
