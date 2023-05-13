import type { SupabaseClient } from "@supabase/supabase-js";
import { writable, type Writable } from "svelte/store";

export let supabaseStore: Writable<SupabaseClient | null> = writable(null);
export function setSupabaseStore(supabase: any) {
    supabaseStore.set(supabase);
}
