import { writable } from 'svelte/store';
import type { CompanyType } from '../models/companyModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const companyInfo = writable<CompanyType[]>([]);
export const companyDetail = writable<CompanyType | undefined>();

//Get all data
export const getCompanyData = async (
	supabase: SupabaseClient,
	searchField?: string | undefined,
	searchQuery?: string | undefined,
	page: number,
	pageSize: number
) => {
	let query = supabase
		.from('company')
		.select(`*`)
		.range((page - 1) * pageSize, page * pageSize - 1)
		.limit(pageSize)
		.order('created_at', { ascending: false });

	let countQuery = supabase.from('company').select('count', { count: 'exact' });

	if (searchField && searchQuery) {
		const lowercaseSearchQuery = searchQuery.toLowerCase();

		if (searchField === 'companyNameField') {
			query = query.ilike('company_name', `%${lowercaseSearchQuery}%`);
			countQuery = countQuery.ilike('company_name', `%${lowercaseSearchQuery}%`);
		} else if (searchField === 'phoneNumberField') {
			query = query.ilike('phone_number', `%${lowercaseSearchQuery}%`);
			countQuery = countQuery.ilike('phone_number', `%${lowercaseSearchQuery}%`);
		} else if (searchField === 'emailField') {
			query = query.ilike('email', `%${lowercaseSearchQuery}%`);
			countQuery = countQuery.ilike('email', `%${lowercaseSearchQuery}%`);
		} else if (searchField === 'emailType') {
			query = query.ilike('type', `%${lowercaseSearchQuery}%`);
			countQuery = countQuery.ilike('type', `%${lowercaseSearchQuery}%`);
		}
	}

	const { data, error } = await query;
	if (error) {

		return [];
	}

	if (data && data.length === 0) {

		companyInfo.set([]); // Clear existing data if no matching data found
		return [];
	}

	const { count } = await countQuery;

	const result = {
		data: data,
		count: count
	};

	companyInfo.set(data as CompanyType[]);
	return result;
};

export const getCompanyDataById = async (supabase: SupabaseClient, id: number) => {
	try {
		const { data, error } = await supabase.from('company').select('*').eq('id', id).single();

		if (error) {
			throw error;
		}
		companyDetail.set(data);
	} catch (error) {

		throw error;
	}
};

export function clearCompanyDetail() {
	companyDetail.set(undefined);
}
