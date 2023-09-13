import type { SupabaseClient } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export interface SeatDesignModel {
	id: number | undefined;
	width: number | undefined;
	height: number | undefined;
	x: number | undefined;
	y: number | undefined;
	border_radius: number | undefined;
	fill_color: string | undefined;
	stroke_width: number | undefined;
	stroke_color: string | undefined;
	rotation: number | undefined;
	is_selectable: boolean | undefined;
	price: number | undefined;
	image_url: string | undefined | null;
}

export interface SeatLayoutModel {
	id: number | undefined;
	name: string;
	image_url: string | undefined;
	exhibition: number | undefined;
	design: JSON | undefined;
	is_active?: boolean;
	areas?: string
}

const createSeatLayoutStore = () => {
	let localState: SeatLayoutModel | undefined;
	const { subscribe, set, update } = writable<SeatLayoutModel>();

	return {
		subscribe,
		setItem: (item: any) => {

			localState = item;
			set(item);
		},
		saveData: async (layoutData: SeatLayoutModel, supabase: SupabaseClient<any, 'public', any>) => {


			if (localState && localState.id) {
				const { data, error } = await supabase.rpc('update_seat_layout_and_seats', {
					layout_data: {
						id: localState.id,
						name: layoutData.name,
						aspect_ratio: localState!.aspect_ratio,
						exhibition: layoutData.exhibition
					},
					seats_data: layoutData.seats
				});
				localState = {
					id: localState.id,
					name: layoutData.name,
					aspect_ratio: localState!.aspect_ratio,
					exhibition: layoutData.exhibition,
					seats: layoutData.seats,
					image_url: localState.image_url
				};

			} else {
				const { data, error } = await supabase.rpc('create_seat_layout_and_seats', {
					layout_data: {
						name: layoutData.name,
						aspect_ratio: localState!.aspect_ratio,
						exhibition: layoutData.exhibition
					},
					seats_data: layoutData.seats
				});

				localState = {
					id: data,
					name: layoutData.name,
					aspect_ratio: localState!.aspect_ratio,
					exhibition: layoutData.exhibition,
					seats: layoutData.seats,
					image_url: layoutData.image_url
				};

			}
		},
		setAreaSize: (size: number) => {

			if (!localState) {
				localState = {
					id: undefined,
					name: '',
					aspect_ratio: size,
					exhibition: undefined,
					seats: [],
					image_url: undefined
				};

			} else {
				localState.aspect_ratio = size;
			}

			update((item) => localState!);
		},
		updateItem: (field: any, value: any) => update((item) => ({ ...item, [field]: value }))
	};
};

export const seatLayoutStore = createSeatLayoutStore();
