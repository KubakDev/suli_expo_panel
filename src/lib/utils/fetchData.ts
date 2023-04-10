import { supabase } from "../../supabase";

async function fetchData(option: { collectionName: string, from: number, to: number, SelectedValues?: string }) {
  const response = await supabase
    .from(option.collectionName)
    .select(option.SelectedValues ?? '*', { count: "exact" })
    .range(option.from, option.to)

  return response;
}

export default fetchData;