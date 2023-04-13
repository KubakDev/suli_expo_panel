import { writable } from "svelte/store";
import { supabase } from "../supabase";
import type { CreateNews } from "../models/news";
import { changeLoadingStatus } from "./loading";
import fetchData from "$lib/utils/fetchData";


export let newsCollection = {
  showModal: writable(false),
  news: writable([]),
  paginationData: writable({}),
  deleteModal: writable(false),
  getNews: async (from: number, to: number) => {
    changeLoadingStatus(true)
    fetchData({ collectionName: "news", from: from, to: to }).then(response => {
      console.log(response)
      let numPages = Math.ceil(response.count! / (to - from))
      let pages = []
      console.log(pages)
      for (let i = 1; i <= numPages; i++) {
        pages.push(
          i,
        );
      }
      console.log(pages)

      let currentPage = Math.ceil(from / (to - from)) + 1
      newsCollection.paginationData.set({ count: response.count, pages: pages, currentPage: currentPage })
      newsCollection.news.set(response.data as [])
      newsCollection.toggleModal(false)
      changeLoadingStatus(false)
    })

  },
  toggleModal: (cond: boolean) => {
    newsCollection.showModal.set(cond)
  },
  toggleDeleteModal: (cond: boolean) => {
    newsCollection.deleteModal.set(cond)
  },
  addNewNews: async (newItem: CreateNews) => {
    changeLoadingStatus(true)
    let { data, error } = await supabase.from("news").insert(newItem);
    if (!error) {
      newsCollection.getNews(0, 5)
    }
    changeLoadingStatus(false)
  },
  deleteNews: async (id: number) => {
    changeLoadingStatus(true)
    console.log("here")
    await supabase.from('news').delete().eq('id', id)
    await newsCollection.getNews(0, 5)
    newsCollection.toggleDeleteModal(false)
    changeLoadingStatus(false)
  }
}
newsCollection.getNews(0, 5)
export let showModal = newsCollection.showModal
export let showDeleteModal = newsCollection.deleteModal
export let paginationData = newsCollection.paginationData;
export default newsCollection.news;

