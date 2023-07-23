import { writable } from 'svelte/store';
import type { SetColorModel } from '../models/setColorModel';

export const setColor = writable<SetColorModel>();

//Get all exhibition data
export const getSetColorData = async (color: SetColorModel) => {
	try {
		setColor.set(color);
		// console.log('color store ', color);
	} catch (error) {
		console.error(error);
		throw error;
	}
};
