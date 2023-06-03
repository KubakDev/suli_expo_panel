import { writable } from 'svelte/store';
import type { VideoModel, VideoModelLang } from '../models/media_VideoModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LanguageEnum } from '../models/languageEnum';

export const vedioStore = writable<VideoModel[]>([]);

export const insertData = async (
	videoObject: VideoModel,
	videoDataLang: VideoModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_media_video_and_video_lang', {
			mediavideo_data: videoObject,
			mediavideo_lang_data: videoDataLang
		});
		// console.log(mediaVedio_lang_data);
		// console.log(data);
		vedioStore.update((currentData) => {
			if (data) {
				return [...(currentData || []), ...data];
			}
			return currentData || [];
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
