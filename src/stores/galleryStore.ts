import { writable } from 'svelte/store';
import type { GalleryModel, GalleryModelLang } from '../models/galleryModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const gallery = writable<GalleryModel[]>([]);

export const insertData = async (
	galleryObject: GalleryModel,
	galleryDataLang: GalleryModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_gallery_and_gallery_lang', {
			gallery_data: galleryObject,
			gallery_lang_data: galleryDataLang
		});
		// console.log(gallery_lang_data);
		// console.log(data);
		gallery.update((currentGallery) => {
			if (data) {
				return [...(currentGallery || []), ...data];
			}
			return currentGallery || [];
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.from('gallery').select('*,gallery_languages(*)');
		console.log('data : ', data);

		gallery.update((currentData) => {
			if (data) {
				return [...currentData, ...data];
			}
			return currentData;
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteData = async (galleryId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_gallery_and_gallery_lang', {
			data: { id: galleryId }
		});

		if (error) {
			throw error;
		}

		gallery.update((currentGallery) => {
			if (data) {
				return currentGallery.filter((item) => item.id !== galleryId);
			}
			return currentGallery;
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
