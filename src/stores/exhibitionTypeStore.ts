import { writable } from 'svelte/store';
import type { ExhibitionModel, ExhibitionModelLang } from '../models/exhibitionTypeModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const exhibition = writable<ExhibitionModel[]>([]);

//Get all exhibition data
export const getDataExhibition = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('exhibition')
			.select('*,exhibition_languages(*)')
			.or('deleted_status.is.null');

		return data as ExhibitionModel[];
	} catch (error) {

		throw error;
	}
};
