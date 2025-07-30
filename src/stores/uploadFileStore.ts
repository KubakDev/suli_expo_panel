import { get, writable } from "svelte/store";
import { supabaseStore } from "./supabaseStore";
import { alertStore } from "./alertStore";
import { getRandomTextNumber } from "$lib/utils/generateRandomNumber";

const uploadFileStore = () => {
	const { subscribe } = writable();

	return {
		subscribe,
		uploadFile: async (file: File): Promise<string | null> => {
			const supabase = get(supabaseStore);
			if (!supabase) return null;

			// Generate unique file name
			const ext = file.name.split('.').pop(); // Get file extension
			const uniqueName = `${Date.now()}_${getRandomTextNumber()}.${ext}`;
			const path = `item_images/${uniqueName}`;

			// Upload the file
			const { error: uploadError } = await supabase.storage.from('image').upload(path, file, {
				cacheControl: '3600',
				upsert: false, // Do not overwrite if it exists
			});

			if (uploadError) {
				console.error('Upload error:', uploadError.message);
                alertStore.addAlert('error', 'Upload Failed', 'error');
				return null;
			}

			const { data: publicData, error: publicUrlError } = supabase.storage
				.from('image')
				.getPublicUrl(path);

			if (publicUrlError || !publicData) {
				console.error('Public URL error:', publicUrlError?.message);
				alertStore.addAlert('error', 'Failed to Get Public URL', publicUrlError?.message || '');
				return null;
			}

            alertStore.addAlert('success', 'Uploaded', 'success');
			return publicData.publicUrl;
		}
	};
};

export default uploadFileStore();
