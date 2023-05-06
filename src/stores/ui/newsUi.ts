import { writable } from "svelte/store";
import { CardType } from "../../models/cardTypeEnum";
import { supabaseStore } from "../supabaseStore";
import type { SupabaseAuthClientOptions } from "@supabase/supabase-js/dist/module/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewsUiModel } from "../../models/newsUiModel";

let newsUiStore = writable<NewsUiModel>();


export async function getNewsUi(supabase: SupabaseClient) {
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
      .eq('page', CardType.News).single();
    const data = response.data as NewsUiModel;
    newsUiStore.set(data);
    // newsUi.set(response.data);
    // console.log(response)
    // newsUi.subscribe(value => {
    //   console.log(value)
    // });;
  }
}



export default newsUiStore;