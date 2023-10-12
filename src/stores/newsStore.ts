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

		throw error;
	}
};

//Get all news data
export const getData = async (supabase: SupabaseClient, page: number, pageSize: number) => {
	try {
		const { data, error } = await supabase
			.from('news')
			.select('*,news_languages(*)')
			.range((page - 1) * pageSize, page * pageSize - 1)
			.limit(pageSize)
			.order('created_at', { ascending: false });

		const { count } = await supabase.from('news').select('count', { count: 'exact' });

		const result = {
			data: data,
			count: count
		};

		news.set(data ?? []);
		return result;
	} catch (error) {
		throw error;
	}
};

//delete news by id
export const deleteData = async (newsId: number, supabase: SupabaseClient) => {
	try {
		const { data, error } = await supabase.rpc('delete_news_and_news_lang', {
			data: { id: newsId }
		});

		if (error) {
			throw error;
		}

		news.update((currentNews) => {
			if (data) {
				return currentNews.filter((item) => item.id !== newsId);
			}
			return currentNews;
		});

		return data;
	} catch (error) {

		throw error;
	}
};

//update news by id
export const updateData = async (
	newsObject: NewsModel,
	newsDataLang: NewsModelLang[],
	supabase: SupabaseClient
) => {
	try {
		const { data, error } = await supabase.rpc('update_news_and_news_lang', {
			news_data: newsObject,
			news_lang_data: newsDataLang
		});

		if (error) {
			throw error;
		}

		news.update((currentNews) => {
			if (data) {
				// Find the index of the updated item
				const index = currentNews.findIndex((item) => item.id === newsObject.id);

				// Create a new array with the updated item
				const updatedNews = [...currentNews.slice(0, index), data, ...currentNews.slice(index + 1)];

				return updatedNews;
			}

			return currentNews;
		});

		return data;
	} catch (error) {

		throw error;
	}
};
