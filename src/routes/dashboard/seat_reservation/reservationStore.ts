
import { get, writable } from "svelte/store";
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReservationStatusEnum } from "./reservationStatusEnum";

export interface SeatReservationModel {
  company_id: number;
  exhibition_id: number;
  object_id: String;
  status: ReservationStatusEnum;
  created_at: Date;
  services: [];
}
const seatReservationStore = () => {
  const { subscribe, set } = writable<SeatReservationModel[]>([]);
  return {
    subscribe: subscribe,
    getSeatReservations: async (supabase: SupabaseClient) => {
      const { data, error } = await supabase.from('seat_reservation').select('*,exhibition(*,exhibition_languages(*)),company(*)');
      if (error) return;

      set(data);
    },

  }
}

export default seatReservationStore();