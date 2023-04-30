import { writable } from "svelte/store";
import { supabase } from "../../supabase";
import { CardType } from "../../models/cardTypeEnum";


let newsUi = writable();


export async function getNewsUi() {
  const response: any = await supabase
    .from('page_builder')
    .select(
      `
				id,
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
    .eq('page', CardType.News);
  newsUi.set(response.data);
}

newsUi.subscribe(value => {
  if (!value) {
    getNewsUi();
  }
});
// check if newsUi is empty

await getNewsUi()

export default newsUi;