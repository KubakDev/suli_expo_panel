import { get, writable } from "svelte/store";
import { supabaseStore } from "./supabaseStore";
import { alertStore } from "./alertStore";



const uploadFileStore = () => {
    const { subscribe, set, update, } = writable();
    return {
        subscribe: subscribe,
        uploadFile: async (file: File): Promise<string | null> => {
            // supabase upload file
            const supabase = get(supabaseStore);
            if (!supabase) return null;
            const { data, error } = await supabase.storage.from('image').upload(`item_images/${file.name}`, file);
            if (error) {
                alertStore.addAlert('error', 'Error', 'error');
                return null;
            } else {
                const { data } = await supabase.storage.from('image').getPublicUrl(`item_images/${file.name}`);

                alertStore.addAlert('success', 'Success', 'success');
                return data.publicUrl;
            }
        }
    }
}


export default uploadFileStore();