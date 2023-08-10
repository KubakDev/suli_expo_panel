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
