<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { TabItem, Tabs } from 'flowbite-svelte';
	import { addNewToast } from '../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../models/toastTypeEnum';
	import { onMount } from 'svelte';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import { THEME_COLORS } from '$lib/utils/themeColors';
	import { IconUpload } from '@tabler/icons-svelte';

	export let exhibitionId: number | null | undefined;

	export let supabase: SupabaseClient;

	let loading = false;

	let selectedLanguage: LanguageEnum = LanguageEnum.EN;
	let languages = Object.values(LanguageEnum);
	let fileContent: { [key in LanguageEnum]?: string } = {};
	let uploadedFileName: { [key in LanguageEnum]?: string } = {};

	onMount(() => {
		selectedLanguage = LanguageEnum.EN;
	});

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input && input.files) {
			const file = input.files[0];
			if (file) {
				uploadedFileName[selectedLanguage] = file.name;

				const reader = new FileReader();
				reader.onload = async function (e: ProgressEvent<FileReader>) {
					if (e.target) {
						fileContent[selectedLanguage] = e.target.result?.toString().split(',')[1];

						loading = true;
						await supabase
							.from('contract_decode_files')
							.delete()
							.eq('exhibition_id', exhibitionId)
							.eq('language', selectedLanguage);

						supabase
							.from('contract_decode_files')
							.insert([
								{
									exhibition_id: exhibitionId,
									decoded_file: fileContent[selectedLanguage],
									language: selectedLanguage
								}
							])
							.then((response) => {
								if (response.error) {
									addNewToast({
										type: ToastTypeEnum.ERROR,
										message: response.error.message
									});
								} else {
									addNewToast({
										title: 'Success',
										duration: 1000,
										type: ToastTypeEnum.SUCCESS,
										message: 'File uploaded successfully for ' + file.name
									});
								}
							});
						loading = false;
					}
				};
				reader.readAsDataURL(file);
			}
		}
	}
</script>

<div class="flex flex-col justify-center items-center p-10 w-full">
	<Tabs contentClass="dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-6 rounded-lg shadow-md">
		{#each languages as lang}
			<TabItem
				title={lang}
				open={selectedLanguage ? selectedLanguage === lang : lang === LanguageEnum.EN}
				on:click={() => (selectedLanguage = lang)}
				class="transition duration-300 dark:hover:bg-gray-700 p-2 rounded"
			>
				<h1 class="text-xl text-gray-600 dark:text-gray-300 font-bold mb-3">
					{#if lang === 'ar'}
						{`أضف البيانات إلى اللغة العربية`}
					{:else if lang === 'ckb'}
						{`زیاد کردنی داتا بە زمانی کوردی`}
					{:else}
						Add data for <span class="uppercase">{`${lang}`}</span> language
					{/if}
				</h1>
				<p class="mb-4 text-gray-500">For other languages, navigate between tabs.</p>

				<div class="py-5">
					<label
						for={`file-input-${lang}`}
						class="file-input-container transition duration-300 flex items-center gap-2"
						style="background-color: var(--primary)"
					>
						<IconUpload class="w-5 h-5" />
						Upload File
					</label>
					<input
						id={`file-input-${lang}`}
						type="file"
						on:change={handleFileChange}
						style="display: none;"
					/>
					<p class="mt-2 text-sm text-gray-600">{uploadedFileName[lang] || 'No file chosen'}</p>
				</div>
			</TabItem>
		{/each}
	</Tabs>
</div>

<style>
	/* Hide the "No file chosen" text */
	input[type='file']::-webkit-file-upload-button {
		visibility: hidden;
	}

	/* Style the input to make it look better */
	input[type='file'] {
		font-size: 0;
		position: absolute;
		z-index: -1;
	}

	/* Style the container to mimic a button */
	.file-input-container {
		color: white;
		padding: 10px 20px;
		border-radius: 8px;
		cursor: pointer;
		display: inline-flex;
		transition: all 0.3s ease;
		font-weight: 500;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.file-input-container:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.file-input-container:active {
		transform: translateY(1px);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}
</style>
