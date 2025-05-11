<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/galleryStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { GalleryModel, GalleryModelLang } from '../../../../models/galleryModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import type { ImagesModel } from '../../../../models/imagesModel';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
	import { handleFileUpload } from '$lib/utils/handleFileUpload';
	import { IconDeviceFloppy, IconX } from '@tabler/icons-svelte';
	import { getImagesObject } from '$lib/utils/updateCarouselImages';

	export let data;
	let sliderImagesFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let imageFile: File | undefined;
	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};
	let loaded = false;
	let carouselImages: CarouselImage[] | undefined = undefined;

	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let galleryDataLang: GalleryModelLang[] = [];
	let galleryData: GalleryModel = {
		id: 0,
		images: [],
		thumbnail: '',
		exhibition_type: '',
		created_at: new Date()
	};
	const id = $page.params.galleryId;
	let images: ImagesModel[] = [];

	//**** get data from db and put it into the fields ****//
	async function getDataGallery() {
		loaded = false;
		await data.supabase
			.from('gallery')
			.select('*,gallery_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				galleryData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					created_at: new Date(result.data?.created_at)
				};

				//
				//
				prevThumbnail = result.data?.thumbnail;
				images = getImage();
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.gallery_languages.findIndex(
						(galleryLang: GalleryModelLang) =>
							galleryLang.language == LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const galleryLang = result.data?.gallery_languages[index];
					galleryDataLang.push({
						title: galleryLang?.title ?? '',
						short_description: galleryLang?.short_description ?? '',
						long_description: galleryLang?.long_description ?? '',
						// created_at: galleryLang ? new Date(galleryLang.created_at) : new Date(),
						language:
							galleryLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				galleryDataLang = [...galleryDataLang];
				galleryData = { ...galleryData };
				carouselImages = getImagesObject(galleryData);
			});
			loaded = true;
	}

	onMount(async () => {
		await getDataGallery();
	});

	//** for swapping between languages**//

	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
	}

	//get image
	function getImage() {
		let result = galleryData.images.map((image, i) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		//
		return result;
	}

	//**Handle submit**//
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
				// At least one field is not empty
				hasDataForLanguage = true;
				if (isTitleEmpty || isShortDescriptionEmpty || isLongDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(galleryData.thumbnail) && galleryData.images.length > 0) {
			isValidGalleryObject = true;
		}
		if (hasDataForLanguage && isValidGalleryObject) {
			submitted = true;
			showToast = true;
			galleryData.images = [];

			if (imageFile) {
				if (galleryData.thumbnail) {
					await data.supabase.storage.from('image').remove([galleryData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				galleryData.thumbnail = response.data?.path || '';
			} else {
				galleryData.thumbnail = prevThumbnail;
			}

			if (sliderImagesFile.length > 0) {
				for (let image of sliderImagesFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`gallery/${randomText}`, image!);

					if (responseMultiple.data?.path) {
						galleryData.images.push(responseMultiple.data?.path);
					}
				}
			}

			for (let image of existingImages) {
				galleryData.images.push(image);
			}

			// Convert galleryObject.images to a valid array string format
			const imagesArray = galleryData.images.map((image) => `"${image}"`);
			galleryData.images = `{${imagesArray.join(',')}}`;

			updateData(galleryData, galleryDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/gallery');
			}, 1000);
		} else {
			isFormSubmitted = true;
			return;
		}
	}

	function imageChanges(e: any) {
		//
		let result: any = [];
		let customImages: any = [];
		//
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

	function handleSelectChange(event: Event) {
		const selectedValue = (event.target as HTMLSelectElement).value;
		if (selectedValue === 'Select Type') {
			delete galleryData.exhibition_id;
		} else {
			galleryData.exhibition_id = parseInt(selectedValue, 10);
		}
	}

	function setImageFile(file: File) {
		imageFile = file;
		
		// Create an immediate preview URL
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				galleryData.thumbnail = e.target?.result as string;
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
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Gallery updated successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update Gallery</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Update gallery content with images and descriptions</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Gallery Thumbnail</span>
						<div class="relative">
							{#if galleryData.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											galleryData.thumbnail = '';
											imageFile = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={(event) =>
									handleFileUpload(event, galleryData, setImageFile, setFileName, 'gallery')}
								accept=".jpg, .jpeg, .png"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>
						{#if isFormSubmitted && !galleryData.thumbnail.trim()}
							<p class="error-message mt-2">Please upload a thumbnail image</p>
						{/if}
					</Label>
				</div>
			</div>

			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<UpdateExhibitionType {handleSelectChange} pageData={galleryData} {data} />
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
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
												Update data for <span class="uppercase">{`${langData.language}`}</span> language
											{/if}
										</h2>
										<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to edit other languages</p>
									</div>

									<!-- Title Section -->
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
										<Label class="block">
											<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Gallery Title</span>
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

									<!-- Gallery Content -->
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg pb-12">
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
						<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
							<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">Gallery Images</span>
							<FileUploadComponent 
								on:imageChanges={imageChanges}
								on:imageFilesChanges={getAllImageFile}
								data={{ images: images }} 
							/>
							{#if isFormSubmitted && galleryData.images.length === 0}
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
								Update Gallery
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
								{#each galleryDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={galleryData.thumbnail || '/src/lib/images/placeholder.png'}
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