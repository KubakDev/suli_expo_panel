import { writable } from 'svelte/store';
import type { MagazineModel, MagazineModelLang } from '../models/magazineModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LanguageEnum } from '../models/languageEnum';

export const magazine = writable<MagazineModel[]>([]);

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
		// console.log(magazine_lang_data);
		// console.log(data);
		magazine.update((currentMagazine) => {
			if (data) {
				return [...(currentMagazine || []), ...data];
			}
			return currentMagazine || [];
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
