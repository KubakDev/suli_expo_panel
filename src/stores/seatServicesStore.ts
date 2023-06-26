import { writable } from 'svelte/store';
import type { seatServicesModel, seatServicesModelLang } from '../models/seatServicesModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ServiceModel, ServiceModelLang } from '../models/serviceModel';

export const seatServices = writable<seatServicesModel[]>([]);

//Create a new instance of the seat-services
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

//Get all seat-services data
export const getData = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('seat_services')
			.select('*,seat_services_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('seat_services').select('count', { count: 'exact' });

		console.log('/////////', count);
		// console.log('data : ', data);
		const result = {
			data: data,
			count: count
		};
		return result;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

//delete seat-services by id
export const deleteData = async (seatServicesId: number, supabase: SupabaseClient) => {
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
		console.error(error);
		throw error;
	}
};

//update seat-services by id
export const updateData = async (
	seatServicesObject: seatServicesModel,
	seatServicesDataLang: seatServicesModelLang[],
	supabase: SupabaseClient
) => {
	try {
		console.log('first');
		const { data, error } = await supabase.rpc('update_seatServices_and_seatServices_lang', {
			seatservices_data: seatServicesObject,
			seatservices_lang_data: seatServicesDataLang
		});

		if (error) {
			throw error;
		}

		seatServices.update((currentSeatServices) => {
			if (data) {
				// Find the index of the updated item
				const index = currentSeatServices.findIndex((item) => item.id === seatServicesObject.id);

				// Create a new array with the updated item
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
		console.error(error);
		throw error;
	}
};
