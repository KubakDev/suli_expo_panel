import { writable } from 'svelte/store';
import type { CarouselModel, CarouselModelLang } from '../models/carouselModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LanguageEnum } from '../models/languageEnum';

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
		// console.log(carouselDataLang);
		console.log(data);
		carousel.update((currentCarousel) => {
			if (data) {
				return [...(currentCarousel || []), ...data];
			}
			return currentCarousel || [];
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
