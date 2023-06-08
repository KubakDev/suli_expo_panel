import { writable } from 'svelte/store';
import type { GalleryModel, GalleryModelLang } from '../models/galleryModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const gallery = writable<GalleryModel[]>([]);

//Create a new instance of the gallery
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

//Get all gallery data
export const getData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.from('gallery').select('*,gallery_languages(*)');
		console.log('data : ', data);

		// gallery.update((currentData) => {
		// 	if (data) {
		// 		return [...currentData, ...data];
		// 	}
		// 	return currentData;
		// });

		return data as GalleryModel[];
	} catch (error) {
		console.error(error);
		throw error;
	}
};

//delete gallery by id
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

//update gallery by id
export const updateData = async (
	galleryObject: GalleryModel,
	galleryDataLang: GalleryModelLang[],
	supabase: SupabaseClient
) => {
	try {
		console.log('first');
		const { data, error } = await supabase.rpc('update_gallery_and_gallery_lang', {
			gallery_data: galleryObject,
			gallery_lang_data: galleryDataLang
		});

		if (error) {
			throw error;
		}

		gallery.update((currentGallery) => {
			if (data) {
				// Find the index of the updated item
				const index = currentGallery.findIndex((item) => item.id === galleryObject.id);

				// Create a new array with the updated item
				const updatedGallery = [
					...currentGallery.slice(0, index),
					data,
					...currentGallery.slice(index + 1)
				];

				return updatedGallery;
			}

			return currentGallery;
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
