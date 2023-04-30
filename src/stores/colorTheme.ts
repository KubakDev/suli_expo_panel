import { writable } from "svelte/store";
import type { ColorTheme } from '../models/colorTheme';
// import { supabase } from "../supabase";

let colorTheme = writable<ColorTheme[]>([])

export async function getAllThemes() {
  // await supabase
  //   .from('color_palette')
  //   .select('*')
  //   .then((res) => {
  //     colorTheme.set(res.data as ColorTheme[]);
  //   });
}
await getAllThemes()
export default colorTheme;