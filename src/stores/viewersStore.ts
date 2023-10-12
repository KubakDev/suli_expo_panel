import { writable } from 'svelte/store';
import type { Viewers } from '../models/viewersModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const viewerData = writable<Viewers>();
export const AllViewersData = writable<Viewers[]>([]);

// Get the latest viewer data based on created_at column
export const getViewerData = async (
	supabase: SupabaseClient,
	limitNumber: number,
	dateString?: Date
) => {
	try {

		let query = supabase
			.from('viewers')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(limitNumber);

		if (dateString) {
			const startOfDay = new Date(dateString).toISOString();
			const endOfDay = new Date(new Date(dateString).setHours(23, 59, 59, 999)).toISOString();

			query = query.filter('created_at', 'gte', startOfDay).filter('created_at', 'lte', endOfDay);
		}

		const { data, error } = await query;

		if (error) {

		} else {
			if (data && data.length > 0) {
				viewerData.set(data[0] as Viewers);
			}
		}
	} catch (error) {

	}
};

// get all viewer
export const getAllViewersData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase
			.from('viewers')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {

		} else {
			AllViewersData.set(data ?? []);
		}
	} catch (error) {

	}
};
