import { writable } from 'svelte/store';
import type { PublishingModel, PublishingModelLang } from '../models/publishingModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const gallery = writable<PublishingModel[]>([]);

export const insertData = async (
	publishingObject: PublishingModel,
	publishingDataLang: PublishingModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_publishing_and_publishing_lang', {
			publishing_data: publishingObject,
			publishing_lang_data: publishingDataLang
		});

		// console.log(data);
		gallery.update((currentData) => {
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
