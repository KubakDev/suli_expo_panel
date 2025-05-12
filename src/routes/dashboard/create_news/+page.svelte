<script lang="ts">
	import { Label, Input, Fileupload, Textarea, ButtonGroup, InputAddon } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/newsStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { NewsModel, NewsModelLang } from '../../../models/newsModel';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { createCarouselImages } from '$lib/utils/createCarouselImages';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconEye, IconX, IconDeviceFloppy } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';
	
	const placeholderImage = '/src/lib/images/placeholder.png';

	export let data;

	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let loaded = true;

	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};

	let carouselImages: CarouselImage[] | undefined = undefined;

	let selectedLanguageTab = LanguageEnum.EN;
	let isFormSubmitted = false;

	let newsDataLang: NewsModelLang[] = [];

	let newsObject: NewsModel = {
		images: [],
		thumbnail: '',
		created_at: new Date(),
		id: 0
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		newsDataLang.push({
			title: '',
			short_description: '',
			long_description: '',
			created_at: new Date(),
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		getImagesObject();
	} //**dropzone**//

	//handle thumbnail images

	function handleFileUploadThumbnail(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;

		const reader = new FileReader();

		reader.onloadend = () => {
			newsObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber();
			fileName = `news/${randomText}`;
		};

		reader.readAsDataURL(file);
	}
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidNewsObject = false;

		for (let lang of newsDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.short_description.trim();
			const longDescription = lang.long_description.trim();

			const isTitleEmpty = isEmpty(title);
			const isShortDescriptionEmpty = isEmpty(shortDescription);
			const isLongDescriptionEmpty = isEmpty(longDescription);

			if (!isTitleEmpty || !isShortDescriptionEmpty || !isLongDescriptionEmpty) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (isTitleEmpty || isShortDescriptionEmpty || isLongDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		// Check if newsObject has a valid thumbnail and at least one slider image
		if (!isEmpty(newsObject.thumbnail) && sliderImagesFile.length > 0) {
			isValidNewsObject = true;
		}

		if (!hasDataForLanguage || !isValidNewsObject) {
			isFormSubmitted = true;
			return;
		}

		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`news/${randomText}`, image!)
				.then((response) => {
					if (response.data) {
						newsObject.images.push(response.data.path);
					}
				});
		}

		let imagesArray: string[] = [];
		if (Array.isArray(newsObject.images)) {
			imagesArray = newsObject.images.map((image) => `"${image}"`);
		}
		newsObject.images = `{${imagesArray.join(',')}}`;

		//
		newsObject.thumbnail = response.data?.path || '';

		insertData(newsObject, newsDataLang, data.supabase);

		resetForm();
		goto('/dashboard/news');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		newsObject = {
			images: [],
			thumbnail: '',
			created_at: new Date(),
			id: 0
		};

		newsDataLang = []; // Resetting newsDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			newsDataLang.push({
				title: '',
				short_description: '',
				long_description: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleSelectChange(event: Event) {
		const selectedValue = (event.target as HTMLSelectElement).value;

		if (selectedValue === 'Select Type') {
			delete newsObject.exhibition_id;
		} else {
			newsObject.exhibition_id = parseInt(selectedValue, 10);
		}
	}

	function getImagesObject() {
		carouselImages = createCarouselImages(sliderImagesFile);

		if (carouselImages.length <= 0) {
			carouselImages = undefined;
		}
	}
	function setImageFile(file: File) {
		imageFile = file;
	}
	function setFileName(name: string) {
		fileName = name;
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">New data has been inserted successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Create News</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Enter news details and upload media files</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">News Image</span>
						<div class="relative">
							{#if newsObject.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											newsObject.thumbnail = '';
											imageFile = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={handleFileUploadThumbnail}
								accept=".jpg, .jpeg, .png"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
						</div>
						{#if isFormSubmitted && !newsObject.thumbnail.trim()}
							<p class="error-message mt-2">Please upload an image</p>
						{/if}
					</Label>
				</div>
			</div>
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<Label class="block mb-4">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
								<InsertExhibitionType {handleSelectChange} {data} />
							</Label>
						</div>
						<div>
							<Label class="block mb-4">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Publication Date</span>
								<Input type="date" bind:value={newsObject.created_at} class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:text-white dark:border-gray-600" />
							</Label>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]" style="pill" class="p-4">
							{#each newsDataLang as langData}
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
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">News Title</span>
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
										
										<!-- Short Description -->
										<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Short Description</span>
												<Textarea
													placeholder="Enter short description"
													rows="4"
													bind:value={langData.short_description}
													id="short_description"
													name="short_description"
													class="w-full"
												/>
												{#if isFormSubmitted && !langData.short_description.trim()}
													<p class="error-message mt-2">Please enter a short description</p>
												{/if}
											</Label>
										</div>

										<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg pb-12">
										<!-- News Content -->
										<div class="mb-12">
											<Label for="textarea-id" class="mb-2">News detail</Label>
											<div class="w-full" style="height: 400px;">
												<QuillEditor placeholder="Write details..." {langData} {isFormSubmitted} />
											</div>
										</div>
									  </div>
									 </div>
								</TabItem>
							{/each}
						</Tabs>
					</form>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
							<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">News Gallery Images</span>
							<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
							{#if isFormSubmitted && sliderImagesFile.length === 0}
								<p class="error-message mt-2">Please upload at least one image for the gallery</p>
							{/if}
						</div>

						<!-- Submit Button -->
						<div class="flex justify-end my-6">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Create News
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
								{#each newsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={newsObject.thumbnail || placeholderImage}
											primaryColor="bg-primary"
											date={newsObject.created_at}
										/>
									{/if}
								{/each}
							</div>
						</TabItem>
						<TabItem title="Gallery">
							<div class="p-4">
								{#each newsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										{#if carouselImages && carouselImages.length > 0}
											<DetailPage imagesCarousel={carouselImages} long_description={langData.long_description} />
										{:else}
											<div class="flex flex-col items-center justify-center text-center p-4">
												<img src={placeholderImage} alt="No gallery images" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
												<p class="text-gray-500 dark:text-gray-400 mb-1">No gallery images available</p>
												<p class="text-xs text-gray-400 dark:text-gray-500">Upload images to see them here</p>
											</div>
										{/if}
									{/if}
								{/each}
							</div>
						</TabItem>
					</Tabs>
				</div>
			</div>
		</div>
	</div>
</div>

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
