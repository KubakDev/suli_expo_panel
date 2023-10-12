import { writable } from 'svelte/store';
import type { StaffModel, StaffModelLang } from '../models/staffModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const staff = writable<StaffModel[]>([]);

//Create a new instance of the staff
export const insertData = async (
	staffObject: StaffModel,
	staffDataLang: StaffModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_staff_and_staff_lang', {
			staff_data: staffObject,
			staff_lang_data: staffDataLang
		});

		staff.update((currentData) => {
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

//Get all staff data
export const getDataStaff = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('staff')
			.select('*,staff_languages(*)')
			.order('created_at', { ascending: false });

		staff.set(data ?? []);
		return data;
	} catch (error) {

		throw error;
	}
};

//delete staff by id
export const deleteData = async (staffId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_staff_and_staff_lang', {
			data: { id: staffId }
		});

		if (error) {
			throw error;
		}

		staff.update((currentStaff) => {
			if (data) {
				return currentStaff.filter((item) => item.id !== staffId);
			}
			return currentStaff;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update staff by id
export const updateData = async (
	staffObject: StaffModel,
	staffDataLang: StaffModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_staff_and_staff_lang', {
			staff_data: staffObject,
			staff_lang_data: staffDataLang
		});

		if (error) {
			throw error;
		}

		staff.update((currentStaff) => {
			if (data) {
				// Find the index of the updated item
				const index = currentStaff.findIndex((item) => item.id === staffObject.id);

				// Create a new array with the updated item
				const updatedNews = [
					...currentStaff.slice(0, index),
					data,
					...currentStaff.slice(index + 1)
				];

				return updatedNews;
			}

			return currentStaff;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
