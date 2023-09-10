import { writable } from 'svelte/store';
import type { Reservation } from '../models/reservationModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const seatReservation = writable<Reservation[]>([]);

//Get all data
export const getReservationData = async (
	supabase: SupabaseClient,
	filters?: any[],
	searchField?: string | undefined,
	searchQuery?: string | undefined,
	page?: number,
	pageSize?: number
) => {
	let query = supabase
		.from('seat_reservation')
		.select(
			`
        *,
        company(*),
        exhibition(*)
    `
		)
		.range((page! - 1) * pageSize!, page! * pageSize! - 1)
		.limit(pageSize!)
		.order('created_at', { ascending: false });

	let countQuery = supabase.from('seat_reservation').select('count', { count: 'exact' });

	// filter data by company information
	let companyIds: any = [];

	if (searchField && searchQuery) {
		const lowercaseSearchQuery = searchQuery.toLowerCase();
		let dataFound = false;

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

			seatReservation.set([]); // Clear existing data if no matching data found
			return [];
		}
	}

	if (companyIds.length > 0) {
		query = query.in('company_id', companyIds);
		countQuery = countQuery.in('company_id', companyIds);
	}

	// filter data by exhibition
	if (filters && filters.length > 0) {
		query = query.in('exhibition_id', filters);
		countQuery = countQuery.in('exhibition_id', filters);
	}

	const { data } = await query.order('id');
	const { count } = await countQuery;

	const result = {
		data: data,
		count: count
	};

	seatReservation.set(data as Reservation[]);
	return result;
};

export const updateData = async (supabase: SupabaseClient, id: number, updatedFields: any, reservationData?: Reservation) => {
	const { data, error } = await supabase
		.from('seat_reservation')
		.update(updatedFields)
		.eq('id', id);

	if (error) {
		console.error('Error updating data:', error);
		throw error;
	}
	const contactInfoResponse = await supabase
		.from('contact_info_languages')
		.select('*')
		.eq('language', 'en')
		.single();
	fetch('../mail', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			emailUser: reservationData?.company?.email,
			name: '',
			message: '',
			reservationData,
			contactInfo: contactInfoResponse.data,
			status: updatedFields.status
		})
	}).then(() => { });
	console.log(reservationData)
	// return data;
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

	// 
	seatReservation.set(data as Reservation[]);
	return data as Reservation;
};

export const getReservationsForCompany = async (supabase: SupabaseClient, companyId: any) => {
	const { data, error } = await supabase
		.from('seat_reservation')
		.select(
			`
        *,
        company(*),
        exhibition(*)
    `
		)
		.eq('company_id', companyId);

	if (error) {
		console.error('Error fetching reservation count for company:', error);
		throw error;
	}

	// console.log(data);

	seatReservation.set(data);
};
