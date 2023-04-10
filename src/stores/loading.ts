import { writable } from "svelte/store";

let loading = writable(false)
export function changeLoadingStatus(cond: boolean) {
  loading.set(cond)
}
export default loading;