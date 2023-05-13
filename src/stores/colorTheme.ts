import { writable } from "svelte/store";
import type { ColorTheme } from '../models/colorTheme';
import { supabaseStore } from "./supabaseStore"

let colorTheme = writable<ColorTheme[]>([])

export async function getAllThemes() {
  let supabase;
  supabaseStore.subscribe(value => {
    if (!value) {
      return
    }
    supabase = value
    supabase
      .from('color_palette')
      .select('*')
      .then((res) => {
        colorTheme.set(res.data as ColorTheme[]);
      });
  });
}
export default colorTheme;