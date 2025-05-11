<script lang="ts">
	import { Label, Input, Fileupload, Textarea, ButtonGroup, InputAddon } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/publishingStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { PublishingModel, PublishingModelLang } from '../../../models/publishingModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import PDFUploadComponent from '$lib/components/pdfUpload.svelte';
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';

	//@ts-ignore
	import { isEmpty } from 'validator';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import { createCarouselImages } from '$lib/utils/createCarouselImages';
	import { handleFileUpload } from '$lib/utils/handleFileUpload';
	import { IconDeviceFloppy } from '@tabler/icons-svelte';

	export let data;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let pdfFiles: File[] = [];
	let isFormSubmitted = false;

	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};

	let carouselImages: CarouselImage[] | undefined = undefined;

	let selectedLanguageTab = LanguageEnum.EN;

	let publishingDataLang: PublishingModelLang[] = [];

	let publishingObject: PublishingModel = {
		images: [],
		thumbnail: '',
		pdf_files: [],
		created_at: new Date(),
		id: 0
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		publishingDataLang.push({
			title: '',
			short_description: '',
			long_description: '',
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		getImagesObject();
	} //**dropzone**//

	//**pdf files**//
	function getAllPDFFile(e: { detail: File[] }) {
		pdfFiles = e.detail;
	}
	//**pdf files**//

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidPublishingObject = false;

		for (let lang of publishingDataLang) {
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

		// Check if publishingObject has a valid thumbnail and at least one slider image
		if (!isEmpty(publishingObject.thumbnail) && sliderImagesFile.length > 0) {
			isValidPublishingObject = true;
		}

		if (!hasDataForLanguage || !isValidPublishingObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		// Upload publishing thumbnail image
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		publishingObject.thumbnail = response.data?.path || '';

		// Upload PDF files
		for (let pdf of pdfFiles) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('PDF')
				.upload(`pdfFiles/${randomText}`, pdf!)
				.then((response) => {
					if (response.data) {
						if (Array.isArray(publishingObject.pdf_files)) {
							publishingObject.pdf_files.push(response.data.path);
						}
					}
				});
		}

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`publishing/${randomText}`, image!)
				.then((response) => {
					if (response.data) {
						if (Array.isArray(publishingObject.images)) {
							publishingObject.images.push(response.data.path);
						}
					}
				});
		}

		// Convert publishingObject.images and publishingObject.pdf_files to valid array string format
		let imagesArray: string[] = [];
		if (Array.isArray(publishingObject.images)) {
			imagesArray = publishingObject.images.map((image) => `"${image}"`);
		}
		publishingObject.images = `{${imagesArray.join(',')}}`;

		let pdfFilesArray: string[] = [];
		if (Array.isArray(publishingObject.pdf_files)) {
			pdfFilesArray = publishingObject.pdf_files.map((pdf) => `"${pdf}"`);
		}
		publishingObject.pdf_files = `{${pdfFilesArray.join(',')}}`;

		// Insert data into Supabase
		insertData(publishingObject, publishingDataLang, data.supabase);

		resetForm();
		goto('/dashboard/publishing');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		publishingObject = {
			images: [],
			thumbnail: '',
			pdf_files: [],
			exhibition_type: '',
			created_at: new Date(),
			id: 0
		};

		publishingDataLang = []; // Resetting publishingDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			publishingDataLang.push({
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
			delete publishingObject.exhibition_id;
		} else {
			publishingObject.exhibition_id = parseInt(selectedValue, 10);
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

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Publishing created successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Create Publishing</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Add publishing content with images and PDF files</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Publishing Thumbnail</span>
						<Fileupload
							on:change={(event) =>
								handleFileUpload(event, publishingObject, setImageFile, setFileName, 'publishing')}
							accept=".jpg, .jpeg, .png .svg"
							class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						/>
						{#if isFormSubmitted && !publishingObject.thumbnail.trim()}
							<p class="error-message mt-2">Please upload a thumbnail image</p>
						{/if}
					</Label>
				</div>
			</div>

			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<InsertExhibitionType {handleSelectChange} {data} />
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
						{#each publishingDataLang as langData}
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
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
										<Label class="block">
											<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Publishing Title</span>
											<Input
												type="text"
												placeholder="Enter title"
												bind:value={langData.title}
												id="title"
												name="title"
												class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
											/>
											{#if isFormSubmitted && !langData.title.trim()}
												<p class="error-message mt-2">Please enter a title</p>
											{/if}
										</Label>
									</div>
									
									<!-- Short Description -->
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
										<Label class="block">
											<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Short Description</span>
											<Textarea
												placeholder="Enter short description"
												rows="4"
												bind:value={langData.short_description}
												id="short_description"
												name="short_description"
												class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
											/>
											{#if isFormSubmitted && !langData.short_description.trim()}
												<p class="error-message mt-2">Please enter a short description</p>
											{/if}
										</Label>
									</div>

									<!-- Publishing Content -->
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg pb-12">
										<div class="mb-12">
											<Label for="textarea-id" class="mb-2">Publishing detail</Label>
											<div class="w-full" style="height: 400px;">
												<QuillEditor placeholder="Write details..." {langData} {isFormSubmitted} />
											</div>
									 	 	</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<div class="grid lg:grid-cols-2 gap-6">
							<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
								<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">Publishing Images</span>
								<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
								{#if isFormSubmitted && sliderImagesFile.length === 0}
									<p class="error-message mt-2">Please upload at least one image for the publishing</p>
								{/if}
							</div>

							<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
								<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">PDF Files</span>
								<PDFUploadComponent on:imageFilesChanges={getAllPDFFile} />
							</div>
						</div>

						<!-- Submit Button -->
						<div class="flex justify-end my-6">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Create Publishing
							</button>
						</div>
					</div>
				</div>
			</div>
			
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-0 border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
					<Tabs style="pill" contentClass="dark:text-white p-4" class="px-4 pt-4">
						<TabItem open title="Preview">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each publishingDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={publishingObject.thumbnail || '/src/lib/images/placeholder.png'}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>
						</TabItem>
						<TabItem title="Publishing">
							<div class="p-4">
								{#each publishingDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										{#if carouselImages && carouselImages.length > 0}
											<DetailPage imagesCarousel={carouselImages} long_description={langData.long_description} />
										{:else}
											<div class="flex flex-col items-center justify-center text-center p-4">
												<img src="/src/lib/images/placeholder.png" alt="No publishing images" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
												<p class="text-gray-500 dark:text-gray-400 mb-1">No publishing images available</p>
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
