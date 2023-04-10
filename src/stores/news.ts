import { writable } from "svelte/store";
import { supabase } from "../supabase";
import type { CreateNews } from "../models/news";
import { changeLoadingStatus } from "./loading";
import fetchData from "$lib/utils/fetchData";


export let newsCollection = {
  showModal: writable(false),
  news: writable([]),
  paginationData: writable(),
  deleteModal: writable(false),
  getNews: async () => {
    changeLoadingStatus(true)
    fetchData({ collectionName: "news", from: 0, to: 5 }).then(response => {
      console.log(response)
      newsCollection.paginationData.set(response.count)
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
      newsCollection.getNews()
    }
    changeLoadingStatus(false)
  },
  deleteNews: async (id: number) => {
    changeLoadingStatus(true)
    console.log("here")
    await supabase.from('news').delete().eq('id', id)
    await newsCollection.getNews()
    newsCollection.toggleDeleteModal(false)
    changeLoadingStatus(false)
  }
}
newsCollection.getNews()
export let showModal = newsCollection.showModal
export let showDeleteModal = newsCollection.deleteModal
export let paginationData = newsCollection.paginationData;
export default newsCollection.news;  