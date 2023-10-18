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
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
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
		created_at: new Date()
	};
	const id = $page.params.newsId;
	let images: ImagesModel[] = [];

	//**** get data from db and put it into the fields ****//
	async function getNewsData() {
		await data.supabase
			.from('news')
			.select('*,news_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				newsData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					created_at: result.data?.created_at
				};

				//
				//
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

	function handleSelectChange(event: any) {
		const selectedValue = event.target.value;
		if (selectedValue === 'Select Type') {
			delete newsData.exhibition_id;
		} else {
			newsData.exhibition_id = selectedValue;
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

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			The Update Was Successfully!
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10">
			<h1 class="text-2xl font-bold">Update News Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload News Image</Label>
					<Fileupload
						on:change={handleFileUploadThumbnail}
						accept=".jpg, .jpeg, .png"
						class="dark:bg-white"
					/>
				</Label>
			</div>

			<div class="col-span-1">
				<UpdateExhibitionType {handleSelectChange} pageData={newsData} {data} />
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<span>Date</span>
					<Input
						type="date"
						bind:value={newsData.created_at}
						class="dark:bg-white dark:text-black"
					/>
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form>
					<Tabs contentClass="dark:bg-gray-900">
						{#each newsDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-10 py-16">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl font-bold">
											{#if langData.language === 'ar'}
												{`أضف البيانات إلى اللغة العربية`}
											{:else if langData.language === 'ckb'}
												{`زیاد کردنی داتا بە زمانی کوردی`}
											{:else}
												{`Add data for ${langData.language} language`}
											{/if}
										</h1>
										<p>for other language navigate between tabs</p>
									</div>
									<div class="pb-10">
										<Label for="first_name" class="mb-2">News Title</Label>

										<Input
											type="text"
											placeholder="Enter title"
											bind:value={langData.title}
											id="title"
											name="title"
										/>
										{#if !langData.title.trim()}
											<p class="error-message">Please enter a title</p>
										{/if}
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">short description</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.short_description}
											id="short_description"
											name="short_description"
										/>
										{#if !langData.short_description.trim()}
											<p class="error-message">Please enter a short description</p>
										{/if}
									</div>
									<div class="pb-0">
										<Label for="textarea-id" class="mb-2">long description</Label>
										<div class="pt-4 w-full" style="height: 400px;">
											<EditorComponent {langData} {isFormSubmitted} />
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</form>
				<!-- upload news image -->
				<FileUploadComponent
					on:imageChanges={imageChanges}
					on:imageFilesChanges={getAllImageFile}
					data={{ images: images }}
				/>
				<!-- upload news image -->
				<!-- button for submitForm -->
				<div class="w-full flex justify-end py-5 px-10">
					<button
						on:click|preventDefault={formSubmit}
						type="submit"
						class="bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
					>
						Update
					</button>
				</div>
			</div>

			<div class="lg:col-span-1 border rounded-lg dark:border-gray-600">
				<Tabs style="underline" contentClass="dark:bg-gray-900">
					<TabItem open title="News List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
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

							<div />
						</div>
					</TabItem>
					<TabItem title="News Detail">
						{#each newsDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<DetailPage
									imagesCarousel={carouselImages}
									long_description={langData.long_description}
								/>
							{/if}
						{/each}
					</TabItem>
				</Tabs>
			</div>
		</div>
	</div>
</div>

<style>
	.error-message {
		color: red;
	}
</style>
