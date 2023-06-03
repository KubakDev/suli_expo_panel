import { writable } from 'svelte/store';
import type { GalleryModel, GalleryModelLang } from '../models/galleryModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LanguageEnum } from '../models/languageEnum';

export const gallery = writable<GalleryModel[]>([]);

export const insertData = async (
	galleryObject: GalleryModel,
	galleryDataLang: GalleryModelLang[],
	supabase: SupabaseClient
) => {
	try {
		galleryObject.images =
			'{"gallery/ftlqpjrpxqoia0c72bkw8m_912023393610bahar1-2022.png","gallery/68luoqmm7rq0mic19jsd8kn_18122021244211atlas.png","gallery/azyogxwbnhkbdkufixm7g_6102022453115book.png","gallery/br04ts6l3st74w31vtyc_15122021153310Ku2.jpg"}';
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

export const selectData = async (supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.from('gallery').select('*,gallery_languages(*)');
		console.log('data : ', data);

		// gallery.update((currentGallery) => {
		// 	if (data) {
		// 		return [...(currentGallery || []), ...data];
		// 	}
		// 	return currentGallery || [];
		// });

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
