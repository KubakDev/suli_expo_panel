import type { SupabaseClient } from '@supabase/supabase-js';
import { writable } from 'svelte/store';
import { convertModel } from '../models/covertModel';
import type { NewsModel } from '../models/news';
const createNewsStore = () => {
	// const logger =new pino.pino({prettyPrint: true});
	const { subscribe, set, update } = writable<NewsModel[]>();

	return {
		subscribe,
		set: (seatLayout: NewsModel[]) => {
			set(seatLayout);
		},
		get: async (supabase: SupabaseClient) => {
			// get current selected language
			const result = await supabase
				.from('news')
				.select('*,news_languages(*)')
				.order('created_at', { ascending: false })
				.limit(9);
			console.log(result);
			if (result.error) {
				return null;
			} else {
				const news = result.data.map((e) => e) as NewsModel[];
				set(news);
				return null;
			}
		}
	};
};

export const newsStore = createNewsStore();
