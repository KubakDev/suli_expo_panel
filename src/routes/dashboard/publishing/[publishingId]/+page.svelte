<script lang="ts">
	import { Label, Input, Fileupload, Textarea, ButtonGroup, InputAddon } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/publishingStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { PublishingModel, PublishingModelLang } from '../../../../models/publishingModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import PDFUploadComponent from '$lib/components/pdfUpload.svelte';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import type { ImagesModel } from '../../../../models/imagesModel';
	import type { PDFModel } from '../../../../models/pdfModel';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
	import { handleFileUpload } from '$lib/utils/handleFileUpload';
	import { getImagesObject } from '$lib/utils/updateCarouselImages';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconDeviceFloppy, IconX } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;
	let sliderImagesFile: File[] = [];
	let sliderPDFFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let existingPDFfiles: string[] = [];
	let imageFile: File | undefined;
	let pdfFiles: File[] = [];
	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};

	let carouselImages: CarouselImage[] | undefined = undefined;
	let loaded = false;

	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let publishingDataLang: PublishingModelLang[] = [];
	let publishingData: PublishingModel = {
		id: 0,
		images: [],
		thumbnail: '',
		pdf_files: [],
		exhibition_type: '',
		created_at: new Date()
	};

	const id = $page.params.publishingId;
	let images: ImagesModel[] = [];
	let pdf_files: PDFModel[] = [];

	//**** get data from db and put it into the fields ****//
	async function getPublishingData() {
		loaded = false;
		await data.supabase
			.from('publishing')
			.select('*,publishing_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				publishingData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					pdf_files: result.data?.pdf_files,
					created_at: new Date(result.data?.created_at)
				};

				//
				//
				prevThumbnail = result.data?.thumbnail;
				images = getImage();
				pdf_files = getPdfFile();
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.publishing_languages.findIndex(
						(publishingLang: PublishingModelLang) =>
							publishingLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const publishingLang = result.data?.publishing_languages[index];
					publishingDataLang.push({
						title: publishingLang?.title ?? '',
						short_description: publishingLang?.short_description ?? '',
						long_description: publishingLang?.long_description ?? '',
						// created_at: publishingLang ? new Date(publishingLang.created_at) : new Date(),
						language:
							publishingLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				publishingDataLang = [...publishingDataLang];
				publishingData = { ...publishingData };
				carouselImages = getImagesObject(publishingData);
			});
			loaded = true;
	}

	onMount(async () => {
		await getPublishingData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		//
	}

	//**pdf files**//
	function getAllPDFFile(e: { detail: File[] }) {
		sliderPDFFile = e.detail;
	}
	//**pdf files**//

	//get image
	function getImage() {
		let result = publishingData.images.map((image, i) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		//
		return result;
	}

	//get pdf File
	function getPdfFile() {
		let result = publishingData.pdf_files.map((file, i) => {
			return {
				id: i,
				imgurl: file,
				imgSource: ImgSourceEnum.PdfRemote
			};
		});
		//
		return result;
	}

	//**Handle submit**//
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
				// At least one field is not empty
				hasDataForLanguage = true;
				if (isTitleEmpty || isShortDescriptionEmpty || isLongDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		// PDF is not required, only thumbnail and images are required
		if (!isEmpty(publishingData.thumbnail) && (publishingData.images.length > 0 || sliderImagesFile.length > 0 || existingImages.length > 0)) {
			isValidPublishingObject = true;
		}

		if (hasDataForLanguage && isValidPublishingObject) {
			submitted = true;
			showToast = true;
			
			// Store initial values
			const initialImages = [...publishingData.images];
			const initialPDFs = [...publishingData.pdf_files];
			
			// Don't clear the arrays, just initialize them
			publishingData.pdf_files = [];
			publishingData.images = [];
			
			if (imageFile) {
				if (publishingData.thumbnail) {
					await data.supabase.storage.from('image').remove([publishingData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				publishingData.thumbnail = response.data?.path || '';
			} else {
				publishingData.thumbnail = prevThumbnail;
			}

			if (sliderImagesFile.length > 0) {
				for (let image of sliderImagesFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`publishing/${randomText}`, image!);
					//

					if (responseMultiple.data?.path) {
						publishingData.images.push(responseMultiple.data?.path);
					}
				}
			}
			
			// Add existing images from the UI
			for (let image of existingImages) {
				publishingData.images.push(image);
			}
			
			// If no new images were added and no existing images in UI, keep the original images
			if (publishingData.images.length === 0 && initialImages.length > 0) {
				publishingData.images = initialImages;
			}
			
			// Convert publishing.images to a valid array string format
			const imagesArray = publishingData.images.map((image) => `"${image}"`);
			publishingData.images = `{${imagesArray.join(',')}}`;

			// ***insert pdf *****//
			if (sliderPDFFile.length > 0) {
				for (let PDFfile of sliderPDFFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('PDF')
						.upload(`pdfFiles/${randomText}`, PDFfile!);
					//

					if (responseMultiple.data?.path) {
						publishingData.pdf_files.push(responseMultiple.data.path);
					}
				}
			}
			
			// Add existing PDFs from the UI
			for (let pdf of existingPDFfiles) {
				publishingData.pdf_files.push(pdf);
			}
			
			// We don't restore initial PDFs if user removed them all
			
			// Convert publishing.pdf_files to a valid array string format
			const pdfArray = publishingData.pdf_files.map((file) => `"${file}"`);
			publishingData.pdf_files = `{${pdfArray.join(',')}}`;

			updateData(publishingData, publishingDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/publishing');
			}, 1000);
		} else {
			isFormSubmitted = true;
			return;
		}
	}

	//update images
	function imageChanges(e: any) {
		//
		let result: any = [];
		let customImages: any = [];
		e.detail.forEach((image: any) => {
			if (image.imgSource === ImgSourceEnum.remote) {
				result.push(image.imgurl);
				//
				const newImage = { ...image };
				newImage.imgurl = `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image.imgurl}`;
				customImages.push(newImage);
			} else {
				customImages.push(image);
			}
		});
		carouselImages = customImages;
		existingImages = result;
		//
	}

	//update pdf file
	function pdfChanges(e: any) {
		let result: string[] = [];
		
		// Clear existing PDFs if the detail array is empty
		if (!e.detail || e.detail.length === 0) {
			result = [];
		} else {
			e.detail.forEach((files: any) => {
				if (files.imgSource === ImgSourceEnum.PdfRemote) {
					result.push(files.imgurl);
				}
			});
		}
		existingPDFfiles = result;
	}

	function handleSelectChange(event: Event) {
		const selectElement = event.target as HTMLSelectElement;
		const selectedValue = selectElement.value;
		if (selectedValue === 'Select Type') {
			delete publishingData.exhibition_id;
		} else {
			publishingData.exhibition_id = parseInt(selectedValue, 10);
		}
	}

	function setImageFile(file: File) {
		imageFile = file;
		
		// Create an immediate preview URL
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				publishingData.thumbnail = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
	function setFileName(name: string) {
		fileName = name;
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
			<span class="font-medium">Publishing updated successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update Publishing</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Update publishing content with images and PDF files</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Publishing Thumbnail</span>
						<div class="relative">
							{#if publishingData.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											publishingData.thumbnail = '';
											imageFile = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={(event) =>
									handleFileUpload(event, publishingData, setImageFile, setFileName, 'publishing')}
								accept=".jpg, .jpeg, .png"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
						</div>
						{#if isFormSubmitted && !publishingData.thumbnail.trim()}
							<p class="error-message mt-2">Please upload a thumbnail image</p>
						{/if}
					</Label>
				</div>
			</div>

			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<UpdateExhibitionType {handleSelectChange} pageData={publishingData} {data} />
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<Tabs contentClass="dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}]" style="pill" class="p-4">
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
												Update data for <span class="uppercase">{`${langData.language}`}</span> language
											{/if}
										</h2>
										<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to edit other languages</p>
									</div>

									<!-- Title Section -->
									<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
										<Label class="block">
											<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Publishing Title</span>
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

									<!-- Publishing Content -->
									<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg pb-12">
										<div class="mb-12">
											<Label for="textarea-id" class="mb-2">Publishing detail</Label>
											<div class="w-full" style="height: 400px;">
												<QuillEditor placeholder="Write details..." {langData} {isFormSubmitted} />
											</div>
											{#if isFormSubmitted && !langData.long_description.trim()}
												<p class="error-message mt-2">Please enter publishing details</p>
											{/if}
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<div class="grid lg:grid-cols-2 gap-6">
							<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
								<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">Publishing Images</span>
								<FileUploadComponent 
									on:imageChanges={imageChanges}
									on:imageFilesChanges={getAllImageFile}
									data={{ images: images }} 
								/>
								{#if isFormSubmitted && publishingData.images.length === 0}
									<p class="error-message mt-2">Please upload at least one image for the publishing</p>
								{/if}
							</div>

							<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
								<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">PDF Files</span>
								<PDFUploadComponent
									on:imageChanges={pdfChanges}
									on:imageFilesChanges={getAllPDFFile}
									data={{ pdfFiles: pdf_files }} 
								/>
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
								Update Publishing
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
								{#each publishingDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={publishingData.thumbnail || '/src/lib/images/placeholder.png'}
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
											<DetailPage 
												imagesCarousel={carouselImages} 
												long_description={langData.long_description}
											/>
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