import { writable } from 'svelte/store';
import type { PublishingModel, PublishingModelLang } from '../models/publishingModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const publishing = writable<PublishingModel[]>([]);

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

		// 
		publishing.update((currentData) => {
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

//Get all publishing data
export const getData = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('publishing')
			.select('*,publishing_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('publishing').select('count', { count: 'exact' });


		// 
		const result = {
			data: data,
			count: count
		};

		publishing.set(data ?? []);
		return result;
	} catch (error) {

		throw error;
	}
};

//delete publishing by id
export const deleteData = async (publishingId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_publishing_and_publishing_lang', {
			data: { id: publishingId }
		});

		if (error) {
			throw error;
		}

		publishing.update((currentData) => {
			if (data) {
				return currentData.filter((item) => item.id !== publishingId);
			}
			return currentData;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update publishing by id
export const updateData = async (
	publishingObject: PublishingModel,
	publishingDataLang: PublishingModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_publishing_and_publishing_lang', {
			publishing_data: publishingObject,
			publishing_lang_data: publishingDataLang
		});

		if (error) {
			throw error;
		}

		publishing.update((currentPublishing) => {
			if (data) {
				// Find the index of the updated item
				const index = currentPublishing.findIndex((item) => item.id === publishingObject.id);

				// Create a new array with the updated item
				const updatedPublishing = [
					...currentPublishing.slice(0, index),
					data,
					...currentPublishing.slice(index + 1)
				];

				return updatedPublishing;
			}

			return currentPublishing;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
