import { writable } from 'svelte/store';
import type { seatServicesModel, seatServicesModelLang } from '../models/seatServicesModel';
import type { SupabaseClient } from '@supabase/supabase-js';

//Create a new instance of the seat_services
const createSeatServiceStore = () => {
	const { subscribe, set, update } = writable<seatServicesModel[]>();

	return {
		subscribe,
		set: async (
			seatServicesObject: seatServicesModel,
			seatServicesDataLang: seatServicesModelLang[],
			supabase: SupabaseClient
		) => {
			const { data, error } = await supabase.rpc('insert_seatServices_and_seatServices_lang', {
				seatservices_data: seatServicesObject,
				seatservices_lang_data: seatServicesDataLang
			});

			return data;
		},
		get: async (supabase: SupabaseClient) => {
			const result = await supabase
				.from('seat_services')
				.select('*,languages:seat_services_languages(*)');
			const data = result.data as seatServicesModel[];
			console.log(data);
			set(data);
			return data;
		}
	};
};

export const seatServiceStore = createSeatServiceStore();
