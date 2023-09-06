import { writable } from 'svelte/store';
import type { Viewers } from '../models/viewersModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const viewerData = writable<Viewers>();
// Get the latest viewer data based on created_at column
export const getViewerData = async (supabase: SupabaseClient, limitNumber: number) => {
	try {
		const { data, error } = await supabase
			.from('viewers')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(limitNumber); // Fetch only one row

		if (error) {
			console.error('Error fetching viewer data:', error);
		} else {
			viewerData.set(data[0] as Viewers);
		}
	} catch (error) {
		console.error('Error fetching viewer data:', error);
	}
};
