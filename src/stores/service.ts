import { writable } from "svelte/store";
import type { Service } from "../models/service";
import type { SupabaseClient } from "@supabase/supabase-js";

let services = writable<Service[]>([]);

export async function getAllServices(supabase: SupabaseClient) {

  await supabase.from("service")
    .select('*, service_languages(*)')
    .then(response => {
      services.set(response.data as Service[])
    })
}
export default services;