import { writable } from 'svelte/store';
import type { seatServicesModel, seatServicesModelLang } from '../models/seatServicesModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const seatServices = writable<seatServicesModel[]>([]);

//Create a new instance of the seat-services
export const insertDataToSeatService = async (
	seatServicesObject: seatServicesModel,
	seatServicesDataLang: seatServicesModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_seatServices_and_seatServices_lang', {
			seatservices_data: seatServicesObject,
			seatservices_lang_data: seatServicesDataLang
		});

		seatServices.update((currentData) => {
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

//Get all seat-services data
export const getSeatServices = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('seat_services')
			.select('*,seat_services_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('seat_services').select('count', { count: 'exact' });

		const result = {
			data: data,
			count: count
		};

		seatServices.set(data ?? []);
		return result;
	} catch (error) {

		throw error;
	}
};

//delete seat-services by id
export const deleteSeatService = async (seatServicesId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_seatServices_and_seatServices_lang', {
			data: { id: seatServicesId }
		});

		if (error) {
			throw error;
		}

		seatServices.update((currentSeatServices) => {
			if (data) {
				return currentSeatServices.filter((item) => item.id !== seatServicesId);
			}
			return currentSeatServices;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update seat-services by id
export const updateSeatService = async (
	seatServicesObject: seatServicesModel,
	seatServicesDataLang: seatServicesModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('update_seatServices_and_seatServices_lang', {
			seatservices_data: seatServicesObject,
			seatservices_lang_data: seatServicesDataLang
		});

		if (error) {
			throw error;
		}

		seatServices.update((currentSeatServices) => {
			if (data) {
				const index = currentSeatServices.findIndex((item) => item.id === seatServicesObject.id);

				const updatedSeatServices = [
					...currentSeatServices.slice(0, index),
					data,
					...currentSeatServices.slice(index + 1)
				];

				return updatedSeatServices;
			}

			return currentSeatServices;
		});

		return data;
	} catch (error) {
		throw error;
	}
};

// get  data by id
export const getSeatServicesByIds = async (supabase: SupabaseClient, ids: number[]) => {
	try {
		const { data, error } = await supabase
			.from('seat_services')
			.select('*,seat_services_languages(*)')
			.in('id', ids);

		if (error) {

			throw error;
		}
		// 

		return data;
	} catch (error) {

		throw error;
	}
};
