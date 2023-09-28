import { writable } from 'svelte/store';
import type { ContactModel, ContactModelLang } from '../models/contactModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const contactData = writable<ContactModel[]>([]);

export const insertData = async (
	contactInfoObject: ContactModel,
	contactInfoDataLang: ContactModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_contactInfo_and_contactInfo_lang', {
			contactinfo_data: contactInfoObject,
			contactinfo_lang_data: contactInfoDataLang
		});

		// 
		contactData.update((currentData) => {
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

//Get contactInfo data
export const getData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('contact_info')
			.select('*,contact_info_languages(*)')
			.order('created_at', { ascending: false });

		contactData.set(data ?? []);
		return data;
	} catch (error) {

		throw error;
	}
};

//delete contactInfo by id
export const deleteData = async (contactInfo_id: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_contactInfo_and_contactInfo_lang', {
			data: { id: contactInfo_id }
		});

		if (error) {
			throw error;
		}

		contactData.update((currentContactInfo) => {
			if (data) {
				return currentContactInfo.filter((item) => item.id !== contactInfo_id);
			}
			return currentContactInfo;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update contactInfo by id
export const updateData = async (
	contactInfoObject: ContactModel,
	contactInfoDataLang: ContactModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_contactInfo_and_contactInfo_lang', {
			contactinfo_data: contactInfoObject,
			contactinfo_lang_data: contactInfoDataLang
		});

		if (error) {
			throw error;
		}

		contactData.update((currentContactInfo) => {
			if (data) {
				// Find the index of the updated item
				const index = currentContactInfo.findIndex((item) => item.id === contactInfoObject.id);

				// Create a new array with the updated item
				const updatedContactInfo = [
					...currentContactInfo.slice(0, index),
					data,
					...currentContactInfo.slice(index + 1)
				];

				return updatedContactInfo;
			}

			return currentContactInfo;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
