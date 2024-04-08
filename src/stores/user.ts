import { writable } from 'svelte/store';
import type { UserInfo } from '../models/usersModel';

let userInfo = writable({});
export function changeUserInfo(info: UserInfo) {
	userInfo.set(info);
}
