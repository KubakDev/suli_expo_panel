import { writable } from 'svelte/store';
import type { ServiceModel, ServiceModelLang } from '../models/serviceModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const news = writable<ServiceModel[]>([]);

//Create a new instance of the news
export const insertData = async (
	serviceObject: ServiceModel,
	serviceDataLang: ServiceModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_service_and_service_lang', {
			service_data: serviceObject,
			service_lang_data: serviceDataLang
		});

		news.update((currentData) => {
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
