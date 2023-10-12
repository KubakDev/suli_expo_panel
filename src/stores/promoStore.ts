import { writable } from 'svelte/store';
import type { PromoModel, PromoModelLang } from '../models/promoModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const promotion = writable<PromoModel[]>([]);

// insert data into promo table
export const insertData = async (
	promotionObject: PromoModel,
	promotionDataLang: PromoModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_promo_and_promo_lang', {
			promo_data: promotionObject,
			promo_lang_data: promotionDataLang
		});

		// 
		promotion.update((currentData) => {
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

// Get all promo data
export const getData = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('promo')
			.select('*,promo_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('promo').select('count', { count: 'exact' });

		// 
		// 
		const result = {
			data: data,
			count: count
		};

		promotion.set(data ?? []);
		// 
		return result;
	} catch (error) {

		throw error;
	}
};

// delete promo by id
export const deleteData = async (promoId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_promo_and_promo_lang', {
			data: { id: promoId }
		});

		if (error) {
			throw error;
		}

		promotion.update((currentData) => {
			if (data) {
				return currentData.filter((item) => item.id !== promoId);
			}
			return currentData;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

// update promo by id
export const updateData = async (
	promoObject: PromoModel,
	promoDataLang: PromoModelLang[],
	supabase: SupabaseClient
) => {
	try {
		// 
		const { data, error } = await supabase.rpc('update_promo_and_promo_lang', {
			promo_data: promoObject,
			promo_lang_data: promoDataLang
		});

		if (error) {
			throw error;
		}

		promotion.update((currentPromo) => {
			if (data) {
				// Find the index of the updated item
				const index = currentPromo.findIndex((item) => item.id === promoObject.id);

				// Create a new array with the updated item
				const updatedPromo = [
					...currentPromo.slice(0, index),
					data,
					...currentPromo.slice(index + 1)
				];

				return updatedPromo;
			}

			return currentPromo;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
