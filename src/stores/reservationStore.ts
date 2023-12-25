import { writable } from 'svelte/store';
import type { Reservation, ReservationStatus } from '../models/reservationModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ascending } from 'd3';

export const seatReservation = writable<Reservation[]>([]);
export const seatReservationTotalCount = writable<number>();

export const getReservationData = async (
	supabase: SupabaseClient,
	page: number,
	pageSize: number,
	selectedExhibition?: number | undefined,
	p_company_name?: string,
	p_phone_number?: string,
	p_email?: string
) => {
	let { data } = await supabase.rpc('get_seat_reservations', {
		page_num: page,
		page_size: pageSize,
		p_exhibition_id: selectedExhibition,
		p_company_name: p_company_name,
		p_phone_number: p_phone_number,
		p_email: p_email
	});
	console.log(data);
	seatReservationTotalCount.set(data[0]?.total_count);
	seatReservation.set(data);
};

export const getReservationDataByDependStatus = async (
	supabase: SupabaseClient,
	selectedStatus: string,
	page: number,
	pageSize: number
) => {
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize - 1;

	let { data, error, count } = await supabase
		.from('seat_reservation')
		.select('*,company(*),exhibition(*,exhibition_languages(*))', { count: 'exact' })
		.eq('status', selectedStatus)
		.order('created_at', { ascending: false })
		.range(startIndex, endIndex);

	if (error) {
		return;
	}

	seatReservation.set(data ?? []);
	seatReservationTotalCount.set(count ?? 0);
};

export const getReservationDataByDependEdited = async (
	supabase: SupabaseClient,
	selectedEdited: boolean,
	page: number,
	pageSize: number
) => {
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize - 1;

	let { data, error, count } = await supabase
		.from('seat_reservation')
		.select('*,company(*),exhibition(*,exhibition_languages(*))', { count: 'exact' })
		.eq('new_edit', selectedEdited)
		.order('created_at', { ascending: false })
		.range(startIndex, endIndex);
	if (error) {
		return;
	}
	seatReservation.set(data ?? []);
	seatReservationTotalCount.set(count ?? 0);
};

export const updateData = async (supabase: SupabaseClient, id: number, updatedFields: any) => {
	const { data, error } = await supabase
		.from('seat_reservation')
		.update(updatedFields)
		.eq('id', id);

	if (error) {
		throw error;
	}

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
		.order('created_at', { ascending: false })
		.single();

	if (error) {
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
		.eq('company_id', companyId)
		.order('created_at ', { ascending: false });

	if (error) {
		throw error;
	}

	//

	seatReservation.set(data);
};
