<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/newsStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { NewsModel, NewsModelLang } from '../../../../models/newsModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import type { ImagesModel } from '../../../../models/imagesModel';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
	import { getImagesObject } from '$lib/utils/updateCarouselImages';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconEye, IconX, IconDeviceFloppy } from '@tabler/icons-svelte';

	let loaded = false;
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

	let carouselImages: CarouselImage[] | undefined = undefined;

	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let newsDataLang: NewsModelLang[] = [];
	let newsData: NewsModel = {
		id: 0,
		images: [],
		thumbnail: '',
		created_at: ''
	};
	const id = $page.params.newsId;
	let images: ImagesModel[] = [];

	//**** get data from db and put it into the fields ****//
	async function getNewsData() {
		loaded = false;
		await data.supabase
			.from('news')
			.select('*,news_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				 const createdAt = new Date(result.data?.created_at).toISOString().split('T')[0]; // Convert to YYYY-MM-DD

				newsData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					created_at: createdAt
				};

				 prevThumbnail = result.data?.thumbnail;
				images = getImage();
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.news_languages.findIndex(
						(newsLang: NewsModelLang) =>
							newsLang.language == LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const newsLang = result.data?.news_languages[index];
					newsDataLang.push({
						title: newsLang?.title ?? '',
						short_description: newsLang?.short_description ?? '',
						long_description: newsLang?.long_description ?? '',
						language:
							newsLang?.language ?? LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				newsDataLang = [...newsDataLang];
				newsData = { ...newsData };
				carouselImages = getImagesObject(newsData);
			});
			loaded = true;
	}

	onMount(async () => {
		await getNewsData();
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
		let result = newsData.images?.map((image, i) => {
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

		for (let lang of newsDataLang) {
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

		if (hasDataForLanguage) {
			submitted = true;
			showToast = true;
			newsData.images = [];
			if (imageFile) {
				if (newsData.thumbnail) {
					await data.supabase.storage.from('image').remove([newsData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				newsData.thumbnail = response.data?.path || '';
			} else {
				newsData.thumbnail = prevThumbnail;
			}

			if (sliderImagesFile.length > 0) {
				for (let image of sliderImagesFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`news/${randomText}`, image!);
					//

					if (responseMultiple.data?.path) {
						newsData.images.push(responseMultiple.data?.path);
					}
				}
			}
			for (let image of existingImages) {
				newsData.images.push(image);
			}
			// Convert newsObject.images to a valid array string format
			const imagesArray = newsData.images.map((image) => `"${image}"`);
			newsData.images = `{${imagesArray.join(',')}}`;

			updateData(newsData, newsDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/news');
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

		e.detail.forEach((image: any) => {
			if (image.imgSource === ImgSourceEnum.remote) {
				result.push(image.imgurl);

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
			delete newsData.exhibition_id;
		} else {
			newsData.exhibition_id = parseInt(selectedValue, 10);
		}
	}

	//  handle thumbnail image change
	function handleFileUploadThumbnail(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;

		const reader = new FileReader();

		reader.onloadend = () => {
			newsData.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber();
			fileName = `news/${randomText}`;
		};

		reader.readAsDataURL(file);
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
			<span class="font-medium">News updated successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update News</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Edit news details and update media files</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">News Image</span>
						<div class="relative">
							{#if newsData.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											newsData.thumbnail = '';
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
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>
					</Label>
				</div>
			</div>
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<Label class="block mb-4">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
								<UpdateExhibitionType {handleSelectChange} pageData={newsData} {data} />
							</Label>
						</div>
						<div>
							<Label class="block mb-4">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Publication Date</span>
								<Input type="date" bind:value={newsData.created_at} class="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
							</Label>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
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
										<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
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
												{#if !langData.title.trim()}
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
													class="w-full"
												/>
												{#if !langData.short_description.trim()}
													<p class="error-message mt-2">Please enter a short description</p>
												{/if}
											</Label>
										</div>

									
										<!-- News Content -->
											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg pb-12">
												<div class="mb-12">
													<Label for="textarea-id" class="mb-2">News Content</Label>
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
						<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
							<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">News Gallery Images</span>
							<FileUploadComponent
								on:imageChanges={imageChanges}
								on:imageFilesChanges={getAllImageFile}
								data={{ images: images }}
							/>
						</div>

						<!-- Submit Button -->
						<div class="flex justify-end my-6">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Update News
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
								{#each newsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={newsData.thumbnail}
											primaryColor="bg-primary"
											date={newsData.created_at}
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
											<DetailPage
												imagesCarousel={carouselImages}
												long_description={langData.long_description}
											/>
										{:else}
											<div class="flex flex-col items-center justify-center text-center p-4">
												<img src="/images/placeholder.png" alt="No gallery images" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
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
