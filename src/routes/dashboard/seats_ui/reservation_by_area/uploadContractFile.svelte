<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { Button } from 'flowbite-svelte';
	import { addNewToast } from '../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../models/toastTypeEnum';
	import { load } from '../../../+page';

	export let exhibitionId: number | null | undefined;
	export let supabase: SupabaseClient;

	let fileInput;
	let base64Output;
	let fileName = '';
	let loading = false;
	async function handleFileChange(event: any) {
		const file = event.target.files[0];
		fileName = file.name;
		if (file) {
			const reader = new FileReader();
			reader.onload = async function (e: any) {
				base64Output = e.target.result.split(',')[1];
				// console.log(base64Output);
				loading = true;
				await supabase.from('contract_decode_files').delete().eq('exhibition_id', exhibitionId);
				supabase
					.from('contract_decode_files')
					.insert([
						{
							exhibition_id: exhibitionId,
							decoded_file: base64Output
						}
					] as any)
					.then((response) => {
						if (response.error) {
							addNewToast({
								type: ToastTypeEnum.ERROR,
								message: response.error.message
							});
						} else {
							addNewToast({
								type: ToastTypeEnum.SUCCESS,
								message: 'File uploaded successfully'
							});
						}
					});
				loading = false;
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<div class="min-h-[700px] flex flex-col justify-center items-center">
	<label for="file-input" class="file-input-container"> Upload File </label>

	<input
		id="file-input"
		bind:this={fileInput}
		type="file"
		on:change={handleFileChange}
		style="display: none;"
	/>
	<p>{fileName}</p>
</div>

<style>
	/* Hide the "No file chosen" text */
	input[type='file']::-webkit-file-upload-button {
		visibility: hidden;
	}

	/* Style the input to make it look better */
	input[type='file'] {
		font-size: 0; /* Make the input font size zero */
		position: absolute;
		z-index: -1;
	}

	/* Style the container to mimic a button */
	.file-input-container {
		background-color: #e1b168;
		color: white;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		display: inline-block;
	}
</style>
