import { get, writable } from "svelte/store";
import { supabaseStore } from "./supabaseStore";
import { alertStore } from "./alertStore";

export interface SeatImageItemModel {
    id?: number;
    name: string;
    image_url: string;
}

const seatImageItemStore = () => {
    const { subscribe, set, update } = writable<SeatImageItemModel[]>([]);
    return {
        subscribe: subscribe,
        uploadSeatItem: async (seatItemModel: SeatImageItemModel) => {
            const supabase = get(supabaseStore);
            if (!supabase) return null;
            const { data, error } = await supabase.from('seat_items').insert([seatItemModel]);
            if (error) {
                alertStore.addAlert('error', error.message, 'error');
                return null;
            }
            return data;
        },
        getAllSeatItems: async () => {
            const supabase = get(supabaseStore);
            if (!supabase) return null;
            const { data, error } = await supabase.from('seat_items').select('*');
            if (error) {
                alertStore.addAlert('error', error.message, 'error');
                return null;
            }
            set(data as SeatImageItemModel[]);
            return data;
        }
    }
}

export default seatImageItemStore();