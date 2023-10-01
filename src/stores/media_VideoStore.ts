import { writable } from 'svelte/store';
import type { VideoModel, VideoModelLang } from '../models/media_VideoModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const vedioStore = writable<VideoModel[]>([]);

//insert a video data
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
		// 
		// 
		vedioStore.update((currentData) => {
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

//Get all media_videos data
export const getData = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('media_video')
			.select('*,media_video_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('media_video').select('count', { count: 'exact' });


		// 
		const result = {
			data: data,
			count: count
		};

		vedioStore.set(data ?? []);
		return result;
	} catch (error) {

		throw error;
	}
};

//delete media_videos by id
export const deleteData = async (mediaVideoId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_media_video_and_video_lang', {
			data: { id: mediaVideoId }
		});

		if (error) {
			throw error;
		}

		vedioStore.update((currentData) => {
			if (data) {
				return currentData.filter((item) => item.id !== mediaVideoId);
			}
			return currentData;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update media_videos by id
export const updateData = async (
	mediaVideoObject: VideoModel,
	mediaVideoDataLang: VideoModelLang[],
	supabase: SupabaseClient
) => {
	try {

		const { data, error } = await supabase.rpc('update_media_video_and_video_lang', {
			mediavideo_data: mediaVideoObject,
			mediavideo_lang_data: mediaVideoDataLang
		});

		if (error) {
			throw error;
		}

		vedioStore.update((currentMediaVideo) => {
			if (data) {
				// Find the index of the updated item
				const index = currentMediaVideo.findIndex((item) => item.id === mediaVideoObject.id);

				// Create a new array with the updated item
				const updatedGallery = [
					...currentMediaVideo.slice(0, index),
					data,
					...currentMediaVideo.slice(index + 1)
				];

				return updatedGallery;
			}

			return currentMediaVideo;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
