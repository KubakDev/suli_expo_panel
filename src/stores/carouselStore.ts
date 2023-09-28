import { writable } from 'svelte/store';
import type { CarouselModel, CarouselModelLang } from '../models/carouselModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const carousel = writable<CarouselModel[]>([]);

export const insertData = async (
	carouselObject: CarouselModel,
	carouselDataLang: CarouselModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_carousel_and_carousel_lang', {
			carousel_data: carouselObject,
			carousel_data_lang: carouselDataLang
		});
		// 

		carousel.update((currentCarousel) => {
			if (data) {
				return [...(currentCarousel || []), ...data];
			}
			return currentCarousel || [];
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//Get all carousel data
export const getData = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('carousel')
			.select('*,carousel_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('carousel').select('count', { count: 'exact' });


		// 
		const result = {
			data: data,
			count: count
		};

		carousel.set(data ?? []);
		return result;
	} catch (error) {

		throw error;
	}
};

//delete carousel by id
export const deleteData = async (carouselId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_carousel_and_carousel_lang', {
			data: { id: carouselId }
		});

		if (error) {
			throw error;
		}

		carousel.update((currentCarousel) => {
			if (data) {
				return currentCarousel.filter((item) => item.id !== carouselId);
			}
			return currentCarousel;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update carousel by id
export const updateData = async (
	carouselObject: CarouselModel,
	carouselDataLang: CarouselModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_carousel_and_carousel_lang', {
			carousel_data: carouselObject,
			carousel_lang_data: carouselDataLang
		});

		if (error) {
			throw error;
		}

		carousel.update((currentCarousel) => {
			if (data) {
				// Find the index of the updated item
				const index = currentCarousel.findIndex((item) => item.id === carouselObject.id);

				// Create a new array with the updated item
				const updatedCarousel = [
					...currentCarousel.slice(0, index),
					data,
					...currentCarousel.slice(index + 1)
				];

				return updatedCarousel;
			}

			return currentCarousel;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
