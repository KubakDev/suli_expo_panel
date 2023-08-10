import { writable } from 'svelte/store';
import type { Reservation } from '../models/reservationModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const seatReservation = writable<Reservation[]>([]);

//Get all data
export const getData = async (supabase: SupabaseClient) => {
	const { data } = await supabase
		.from('seat_reservation')
		.select(
			`
    *,
    company(*),
    exhibition(*)
  `
		)
		.order('id');
	seatReservation.set(data as Reservation[]);
	console.log('first', data);
	return data as Reservation[];
};
export const updateData = async (supabase: SupabaseClient, id: number, updatedFields: string) => {
	const { data, error } = await supabase
		.from('seat_reservation')
		.update(updatedFields)
		.eq('id', id);

	if (error) {
		console.error('Error updating data:', error);
		throw error;
	}

	console.log('Updated data:', data);
	return data;
};

