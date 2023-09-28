import { writable } from 'svelte/store';
import type { MagazineModel, MagazineModelLang } from '../models/magazineModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const magazine = writable<MagazineModel[]>([]);

//Create a new instance of the magazine
export const insertData = async (
	magazineObject: MagazineModel,
	magazineDataLang: MagazineModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_magazine_and_magazine_lang', {
			magazine_data: magazineObject,
			magazine_lang_data: magazineDataLang
		});
		// 
		// 
		magazine.update((currentMagazine) => {
			if (data) {
				return [...(currentMagazine || []), ...data];
			}
			return currentMagazine || [];
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//Get all magazine data
export const getData = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('magazine')
			.select('*,magazine_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('magazine').select('count', { count: 'exact' });


		// 
		const result = {
			data: data,
			count: count
		};

		magazine.set(data ?? []);
		return result;
	} catch (error) {

		throw error;
	}
};

//delete magazine by id
export const deleteData = async (magazineId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_magazine_and_magazine_lang', {
			data: { id: magazineId }
		});

		if (error) {
			throw error;
		}

		magazine.update((currentMagazine) => {
			if (data) {
				return currentMagazine.filter((item) => item.id !== magazineId);
			}
			return currentMagazine;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update magazine by id
export const updateData = async (
	magazineObject: MagazineModel,
	magazineDataLang: MagazineModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_magazine_and_magazine_lang', {
			magazine_data: magazineObject,
			magazine_lang_data: magazineDataLang
		});

		if (error) {
			throw error;
		}

		magazine.update((currentMagazine) => {
			if (data) {
				// Find the index of the updated item
				const index = currentMagazine.findIndex((item) => item.id === magazineObject.id);

				// Create a new array with the updated item
				const updatedMagazine = [
					...currentMagazine.slice(0, index),
					data,
					...currentMagazine.slice(index + 1)
				];

				return updatedMagazine;
			}

			return currentMagazine;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
