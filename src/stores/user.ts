import { writable } from "svelte/store";

let userInfo = writable({});
export function changeUserInfo(info: any) {
  userInfo.set(info);
}