import { supabaseStore } from "../../stores/supabaseStore";
import type { SupabaseClient } from "@supabase/supabase-js";

async function fetchData(option: { collectionName: string, from: number, to: number, SelectedValues?: string, supabase?: SupabaseClient }) {

  if (!option.supabase) return;
  const response = await option.supabase!
    .from(option.collectionName)
    .select(option.SelectedValues ?? '*', { count: "exact" })
    .range(option.from, option.to)
  return response;
}

export default fetchData;