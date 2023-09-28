import { writable } from 'svelte/store';
import type { ServiceModel, ServiceModelLang } from '../models/serviceModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const service = writable<ServiceModel[]>([]);

//Create a service instance of the service
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

		service.update((currentData) => {
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

//Get all service data &&
export const getData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('service')
			.select('*,service_languages(*)')
			.order('position', { ascending: true });

		service.set(data ?? []);
		// 
	} catch (error) {

		throw error;
	}
};

//delete service by id
export const deleteData = async (serviceId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_service_and_service_lang', {
			data: { id: serviceId }
		});

		if (error) {
			throw error;
		}

		service.update((currentService) => {
			if (data) {
				return currentService.filter((item) => item.id !== serviceId);
			}
			return currentService;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update service by id
export const updateData = async (
	serviceObject: ServiceModel,
	serviceDataLang: ServiceModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_service_and_service_lang', {
			service_data: serviceObject,
			service_lang_data: serviceDataLang
		});

		if (error) {
			throw error;
		}

		service.update((currentService) => {
			if (data) {
				// Find the index of the updated item
				const index = currentService.findIndex((item) => item.id === serviceObject.id);

				// Create a service array with the updated item
				const updatedService = [
					...currentService.slice(0, index),
					data,
					...currentService.slice(index + 1)
				];

				return updatedService;
			}

			return currentService;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
