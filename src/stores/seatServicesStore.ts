import { writable } from 'svelte/store';
import type { seatServicesModel, seatServicesModelLang } from '../models/seatServicesModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const seatServices = writable<seatServicesModel[]>([]);

//Create a new instance of the seat_services
export const insertData = async (
	seatServicesObject: seatServicesModel,
	seatServicesDataLang: seatServicesModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_seatServices_and_seatServices_lang', {
			seatservices_data: seatServicesObject,
			seatservices_lang_data: seatServicesDataLang
		});

		// console.log(data);
		seatServices.update((currentData) => {
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
