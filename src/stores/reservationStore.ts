import { writable } from 'svelte/store';
import type { Reservation } from '../models/reservationModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const seatReservation = writable<Reservation[]>([]);

//Get all data
export const getReservationData = async (
	supabase: SupabaseClient,
	filters?: any[],
	searchField?: string | null,
	searchQuery?: string
) => {
	let query = supabase.from('seat_reservation').select(`
        *,
        company(*),
        exhibition(*)
    `);

	// filter data by company information
	let companyIds: any = [];

	if (searchField && searchQuery) {
		const lowercaseSearchQuery = searchQuery.toLowerCase();
		let dataFound = false; // Flag to track if matching data is found

		if (searchField === 'companyNameField') {
			const companyResponse = await supabase
				.from('company')
				.select('id')
				.ilike('company_name', `%${lowercaseSearchQuery}%`);

			companyIds = companyResponse?.data?.map((company) => company.id);
			query = query.filter('company.company_name', 'ilike', `%${lowercaseSearchQuery}%`);

			if (companyResponse.data) {
				if (companyResponse.data.length > 0) {
					dataFound = true;
				}
			}
		} else if (searchField === 'phoneNumberField') {
			const companyResponse = await supabase
				.from('company')
				.select('id')
				.ilike('phone_number', `%${lowercaseSearchQuery}%`);

			companyIds = companyResponse?.data?.map((company) => company.id);
			query = query.filter('company.phone_number', 'ilike', `%${lowercaseSearchQuery}%`);

			if (companyResponse.data) {
				if (companyResponse.data.length > 0) {
					dataFound = true;
				}
			}
		} else if (searchField === 'emailField') {
			const companyResponse = await supabase
				.from('company')
				.select('id')
				.ilike('email', `%${lowercaseSearchQuery}%`);

			companyIds = companyResponse?.data?.map((company) => company.id);
			query = query.filter('company.email', 'ilike', `%${lowercaseSearchQuery}%`);

			if (companyResponse.data) {
				if (companyResponse.data.length > 0) {
					dataFound = true;
				}
			}
		}

		// show the message if data is not found
		if (!dataFound) {
			console.log(`No data found for search query: ${searchQuery}`);
			seatReservation.set([]); // Clear existing data if no matching data found
			return [];
		}
	}

	if (companyIds.length > 0) {
		query = query.in('company_id', companyIds);
	}

	// filter data by exhibition
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

export const getReservationById = async (supabase: SupabaseClient, id: any) => {
	const { data, error } = await supabase
		.from('seat_reservation')
		.select(
			`
        *,
        company(*),
        exhibition(*)
    `
		)
		.eq('id', id)
		.single();

	if (error) {
		console.error('Error fetching data by ID:', error);
		throw error;
	}

	// console.log('Fetched data by ID:', data);
	seatReservation.set(data as Reservation[]);
	return data as Reservation;
};
