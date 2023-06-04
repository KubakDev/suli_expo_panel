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

		// console.log(data);
		contactData.update((currentData) => {
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
