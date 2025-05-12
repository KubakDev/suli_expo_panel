<script lang="ts">
	import { Label, Input, Fileupload, Textarea, ButtonGroup, InputAddon } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/galleryStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { GalleryModel, GalleryModelLang } from '../../../models/galleryModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import { createCarouselImages } from '$lib/utils/createCarouselImages';
	import { handleFileUpload } from '$lib/utils/handleFileUpload';
	import { IconDeviceFloppy, IconX } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;

	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};

	let carouselImages: CarouselImage[] | undefined = undefined;

	let selectedLanguageTab = LanguageEnum.EN;
	let isFormSubmitted = false;

	let galleryDataLang: GalleryModelLang[] = [];

	let galleryObject: GalleryModel = {
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
		galleryDataLang.push({
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

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidGalleryObject = false;

		for (let lang of galleryDataLang) {
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

		// Check if galleryObject has a valid thumbnail and at least one slider image
		if (!isEmpty(galleryObject.thumbnail) && sliderImagesFile.length > 0) {
			isValidGalleryObject = true;
		}

		if (!hasDataForLanguage || !isValidGalleryObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		galleryObject.thumbnail = response.data?.path || '';

		if (sliderImagesFile.length > 0) {
			for (let image of sliderImagesFile) {
				const randomText = getRandomTextNumber();
				await data.supabase.storage
					.from('image')
					.upload(`gallery/${randomText}`, image!)
					.then((response) => {
						if (response.data) {
							if (Array.isArray(galleryObject.images)) {
								galleryObject.images.push(response.data.path);
							}
						}
					});
			}
		}

		let imagesArray: string[] = [];

		if (Array.isArray(galleryObject.images)) {
			imagesArray = galleryObject.images.map((image) => `"${image}"`);
		}
		galleryObject.images = `{${imagesArray.join(',')}}`;

		insertData(galleryObject, galleryDataLang, data.supabase);

		resetForm();
		goto('/dashboard/gallery');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		galleryObject = {
			images: [],
			thumbnail: '',
			exhibition_type: '',
			created_at: new Date(),
			id: 0
		};

		galleryDataLang = []; // Resetting galleryDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			galleryDataLang.push({
				title: '',
				short_description: '',
				long_description: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleSelectChange(event: Event) {
		const selectElement = event.target as HTMLSelectElement;
		const selectedValue = selectElement.value;

		if (selectedValue === 'Select Type') {
			delete galleryObject.exhibition_id;
		} else {
			galleryObject.exhibition_id = parseInt(selectedValue, 0);
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
		
		// Create an immediate preview URL
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				galleryObject.thumbnail = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
	function setFileName(name: string) {
		fileName = name;
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Gallery created successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Create Gallery</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Add gallery content with images and descriptions</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Gallery Thumbnail</span>
						<div class="relative">
							{#if galleryObject.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											galleryObject.thumbnail = '';
											imageFile = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={(event) =>
									handleFileUpload(event, galleryObject, setImageFile, setFileName, 'gallery')}
								accept=".jpg, .jpeg, .png"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
						</div>
						{#if isFormSubmitted && !galleryObject.thumbnail.trim()}
							<p class="error-message mt-2">Please upload a thumbnail image</p>
						{/if}
					</Label>
				</div>
			</div>

			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<InsertExhibitionType {handleSelectChange} {data} />
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<Tabs contentClass="dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}]" style="pill" class="p-4">
						{#each galleryDataLang as langData}
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
												Add data for <span class="uppercase">{`${langData.language}`}</span> language
											{/if}
										</h2>
										<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to add other languages</p>
									</div>

									<!-- Title Section -->
									<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
										<Label class="block">
											<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Gallery Title</span>
											<Input
												type="text"
												placeholder="Enter title"
												bind:value={langData.title}
												id="title"
												name="title"
												class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
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
												class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
											/>
											{#if isFormSubmitted && !langData.short_description.trim()}
												<p class="error-message mt-2">Please enter a short description</p>
											{/if}
										</Label>
									</div>

									<!-- Gallery Content -->
									<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg pb-12">
										<div class="mb-12">
											<Label for="textarea-id" class="mb-2">Gallery detail</Label>
											<div class="w-full" style="height: 400px;">
												<QuillEditor placeholder="Write details..." {langData} {isFormSubmitted} />
											</div>
											{#if isFormSubmitted && !langData.long_description.trim()}
												<p class="error-message mt-2">Please enter gallery details</p>
											{/if}
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
							<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">Gallery Images</span>
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
								Create Gallery
							</button>
						</div>
					</div>
				</div>
			</div>
			
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm p-0 border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
					<Tabs style="pill" contentClass="dark:text-white p-4" class="px-4 pt-4">
						<TabItem open title="Preview">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each galleryDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={galleryObject.thumbnail || '/src/lib/images/placeholder.png'}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>
						</TabItem>
						<TabItem title="Gallery">
							<div class="p-4">
								{#each galleryDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										{#if carouselImages && carouselImages.length > 0}
											<DetailPage imagesCarousel={carouselImages} long_description={langData.long_description} />
										{:else}
											<div class="flex flex-col items-center justify-center text-center p-4">
												<img src="/src/lib/images/placeholder.png" alt="No gallery images" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
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
