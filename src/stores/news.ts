import { get, writable } from 'svelte/store';
import type { CreateNews } from '../models/news';
import { changeLoadingStatus } from './loading';
import fetchData from '$lib/utils/fetchData';
import type { News } from '../models/news';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ImgSourceEnum } from '../models/imgSourceEnum';

export let showModal = writable<boolean>(false);
let news = writable<News[]>([]);
export let paginationData = writable({});
export let showDeleteModal = writable(false);

export async function getNews(from: number, to: number, supabase: SupabaseClient) {
	changeLoadingStatus(true);
	await fetchData({ collectionName: 'news', from: from, to: to, supabase: supabase }).then(
		(response) => {
			let numPages = Math.ceil(response?.count! / (to - from));
			let pages = [];
			for (let i = 1; i <= numPages; i++) {
				pages.push(i);
			}
			let currentPage = Math.ceil(from / (to - from)) + 1;
			paginationData.set({ count: response?.count, pages: pages, currentPage: currentPage });
			const modifiedData = response?.data?.map((item) => {
				return {
					...item,
					imgSource: ImgSourceEnum.remote
				};
			});
			news.set(modifiedData as News[]);
			news.subscribe((value) => { });
			toggleModal(false);
			changeLoadingStatus(false);
		}
	);
}
export function toggleModal(cond: boolean) {
	showModal.set(cond);
}
export function toggleDeleteModal(cond: boolean) {
	showDeleteModal.set(cond);
}
export async function addNewNews(newItem: CreateNews) {
	changeLoadingStatus(true);
	changeLoadingStatus(false);
}
export async function deleteNews(id: number, supabase: SupabaseClient) {

	if (!supabase) return;
	const { data, error } = await supabase.from('news').delete().eq('id', id);
	if (error) {

		return;
	}
	getNews(0, 10, supabase);
}
export default news;
