import { get } from "svelte/store";
import { supabaseStore } from "../../stores/supabaseStore";

async function fetchData(option: { collectionName: string, from: number, to: number, SelectedValues?: string }) {
    const supabase = get(supabaseStore);
    console.log("fetchData", supabase);
    // const response = await supabase!
    //     .from(option.collectionName)
    //     .select(option.SelectedValues ?? '*', { count: "exact" })
    //     .range(option.from, option.to)
    // return response;
}

export default fetchData;