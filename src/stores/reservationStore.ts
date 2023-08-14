import { writable } from 'svelte/store';
import type { Reservation } from '../models/reservationModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const seatReservation = writable<Reservation[]>([]);

//Get all data
export const getReservationData = async (supabase: SupabaseClient, filters?: any[]) => {
	console.log(filters);
	let query = supabase.from('seat_reservation').select(`
        *,
        company(*),
        exhibition(*)
    `);

	if (filters && filters.length > 0) {
		query = query.in('exhibition_id', filters);
	}

	const { data } = await query.order('id');

	seatReservation.set(data as Reservation[]);
	return data as Reservation[];
};

export const updateData = async (supabase: SupabaseClient, id: number, updatedFields: any) => {
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
