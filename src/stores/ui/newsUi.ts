import { writable } from "svelte/store";
import { CardType } from "../../models/cardTypeEnum";
import { supabaseStore } from "../supabaseStore";

let newsUi = writable();


export async function getNewsUi() {
  let supabase;
  supabaseStore.subscribe(value => {
    if (!value) {
      return
    }
    supabase = value
    const response: any = value
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
      .eq('page', CardType.News).then((res) => {
        newsUi.set(res.data);
      });
    // newsUi.set(response.data);
    // console.log(response)
    // newsUi.subscribe(value => {
    //   console.log(value)
    // });;
  });

}

newsUi.subscribe(value => {
  if (!value) {
    getNewsUi();
  }
});
// check if newsUi is empty

await getNewsUi()

export default newsUi;