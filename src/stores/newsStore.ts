import { writable } from 'svelte/store';
import type { NewsModel, NewsModelLang } from '../models/newsModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export const news = writable<NewsModel[]>([]);

//Create a new instance of the news
export const insertData = async (
	newsObject: NewsModel,
	newsDataLang: NewsModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('insert_news_and_news_lang', {
			news_data: newsObject,
			news_lang_data: newsDataLang
		});

		news.update((currentData) => {
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
