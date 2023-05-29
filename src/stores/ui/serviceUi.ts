import { writable } from "svelte/store";
import { CardType } from "../../models/cardTypeEnum";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewsUiModel } from "../../models/newsUiModel";

let serviceUiStore = writable<NewsUiModel>();


export async function getServiceUi(supabase: SupabaseClient) {
  {
    const response: any = await supabase
      .from('page_builder')
      .select(
        `	id,
		component_type:componentTypeId(
			id,
				type
			),
			component:componentId(
				title
			),
			color_palette:color_palette(
			*
      )
		`
      )
      .eq('page', CardType.Service).single();
    const data = response.data as NewsUiModel;
    console.log(data);
    serviceUiStore.set(data);

  }
}



export default serviceUiStore;