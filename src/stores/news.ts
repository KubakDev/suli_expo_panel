import { get, writable } from "svelte/store";
import type { CreateNews } from "../models/news";
import { changeLoadingStatus } from "./loading";
import fetchData from "$lib/utils/fetchData";
import type { News } from "../models/news";
import type { SupabaseClient } from "@supabase/supabase-js";

export let showModal = writable<boolean>(false);
let news = writable<News[]>([]);
export let paginationData = writable({});
export let showDeleteModal = writable(false);

export async function getNews(from: number, to: number, supabase: SupabaseClient) {
  changeLoadingStatus(true)
  await fetchData({ collectionName: "news", from: from, to: to, supabase: supabase }).then(response => {
    console.log(response)
    let numPages = Math.ceil(response?.count! / (to - from))
    let pages = []
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        i,
      );
    }
    let currentPage = Math.ceil(from / (to - from)) + 1
    paginationData.set({ count: response?.count, pages: pages, currentPage: currentPage })
    news.set(response?.data as [])
    news.subscribe(value => {
      console.log(value)
    });
    toggleModal(false)
    changeLoadingStatus(false)
  })

};
export function toggleModal(cond: boolean) {
  showModal.set(cond)
};
export function toggleDeleteModal(cond: boolean) {
  showDeleteModal.set(cond)
};
export async function addNewNews(newItem: CreateNews) {
  changeLoadingStatus(true)
  // let { data, error } = await supabase.from("news").insert({
  //   title: "newItem.title",
  //   card_img: "",
  //   short_description: "newItem.short_description",
  //   long_description: "newItem.long_description",
  // });
  // if (!error) {
  //   newsCollection.getNews(0, 5)
  // }
  changeLoadingStatus(false)
};
export async function deleteNews(id: number) {
  changeLoadingStatus(true)
  // await supabase.from('news').delete().eq('id', id)
  // await newsCollection.getNews(0, 5)
  toggleDeleteModal(false)
  changeLoadingStatus(false)
}

// export let showModal = newsCollection.showModal
// export let showDeleteModal = newsCollection.deleteModal
// export let paginationData = newsCollection.paginationData;
// export let getNews = newsCollection.getNews;
export default news;

