<script lang="ts">
	import { Label, Input, Fileupload, InputAddon, ButtonGroup } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/promoStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { PromoModel, PromoModelLang } from '../../../models/promoModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import { IconX, IconDeviceFloppy } from '@tabler/icons-svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';
	
	const placeholderImage = '/src/lib/images/placeholder.png';

	export let data;
	let isFormSubmitted = false;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let selectedLanguageTab = LanguageEnum.EN;
	let loaded = true;

	let promoDataLang: PromoModelLang[] = [];

	let promoObject: PromoModel = {
		id: 0,
		thumbnail: ''
	};

	function handleSelectChange(event: Event) {
		const selectedValue = (event.target as HTMLSelectElement).value;
		if (selectedValue === 'Select Type') {
			delete promoObject.exhibition_id;
		} else {
			promoObject.exhibition_id = parseInt(selectedValue, 10);
		}
	}

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		promoDataLang.push({
			title: '',
			video_link: '',
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			promoObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `promotions/${randomText}`; // Append random text to the file name
		};

		reader.readAsDataURL(file);
	}

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidPromoObject = false;
		// Insert data into Supabase

		for (let lang of promoDataLang) {
			const title = lang.title.trim();
			const link = lang.video_link.trim();

			const isTitleEmpty = isEmpty(title);
			const isLinkEmpty = isEmpty(link);

			if (!isTitleEmpty || !isLinkEmpty) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (isTitleEmpty || isLinkEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		// Check if galleryObject has a valid thumbnail and at least one slider image
		if (!isEmpty(promoObject.thumbnail)) {
			isValidPromoObject = true;
		}

		if (!hasDataForLanguage || !isValidPromoObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		// Upload promo thumbnail image
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		promoObject.thumbnail = response.data?.path || '';

		insertData(promoObject, promoDataLang, data.supabase);

		resetForm();
		goto('/dashboard/promotions');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		promoObject = {
			id: 0,
			thumbnail: ''
		};

		promoDataLang = []; // Resetting promoDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			promoDataLang.push({
				title: '',
				video_link: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}
</script>

{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="min-h-screen bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Promotion has been created successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Create Promotion</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Enter promotion details and upload media</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Promotion Image</span>
						<div class="relative">
							{#if promoObject.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											promoObject.thumbnail = '';
											imageFile = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={handleFileUpload}
								accept=".jpg, .jpeg, .png, .svg"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
						</div>
						{#if isFormSubmitted && !promoObject.thumbnail.trim()}
							<p class="error-message mt-2">Please upload an image</p>
						{/if}
					</Label>
				</div>
			</div>
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<InsertExhibitionType {handleSelectChange} {data} />
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]" style="pill" class="p-4">
							{#each promoDataLang as langData}
								<TabItem
									open={langData.language == selectedLanguageTab}
									title={langData.language}
									on:click={() => {
										selectedLanguageTab = langData.language;
									}}
								>
									<div class="p-6 text-gray-700 dark:text-gray-200">
										<div class="text-center mb-8">
											<h2 class="text-xl font-semibold mb-2">
												{#if langData.language === 'ar'}
													{`أضف البيانات إلى اللغة العربية`}
												{:else if langData.language === 'ckb'}
													{`زیاد کردنی داتا بە زمانی کوردی`}
												{:else}
													{`English Language Content`}
												{/if}
											</h2>
											<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to edit other languages</p>
										</div>

										<!-- Title Section -->
										<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Promotion Title</span>
												<Input
													type="text"
													placeholder="Enter title"
													bind:value={langData.title}
													id="title"
													name="title"
													class="w-full"
												/>
												{#if isFormSubmitted && !langData.title.trim()}
													<p class="error-message mt-2">Please enter a title</p>
												{/if}
											</Label>
										</div>
										
										<!-- Video Link -->
										<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Video Link</span>
												<Input
													type="text"
													placeholder="Enter video link (YouTube, Vimeo, etc.)"
													bind:value={langData.video_link}
													id="video_link"
													name="video_link"
													class="w-full"
												/>
												{#if isFormSubmitted && !langData.video_link.trim()}
													<p class="error-message mt-2">Please enter a video link</p>
												{/if}
											</Label>
										</div>
									</div>
								</TabItem>
							{/each}
						</Tabs>
					</form>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<!-- Submit Button -->
						<div class="flex justify-end my-6">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Create Promotion
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-0 border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
					<Tabs style="pill" contentClass="dark:text-white p-4" class="px-4 pt-4">
						<TabItem open title="Preview">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each promoDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Video}
											title={langData.title}
											short_description=""
											thumbnail={promoObject.thumbnail || placeholderImage}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>
							<div class="p-4 mt-2 text-center">
								{#if promoDataLang.find(lang => lang.language === selectedLanguageTab)?.video_link}
									<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
										Video Link: <span class="font-medium">{promoDataLang.find(lang => lang.language === selectedLanguageTab)?.video_link}</span>
									</p>
								{/if}
							</div>
						</TabItem>
					</Tabs>
				</div>
			</div>
		</div>
	</div>
</div>
{/if}

<style>
	.error-message {
		color: #ef4444;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	.error-message::before {
		content: '!';
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		background-color: #ef4444;
		color: white;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: bold;
	}
</style>
