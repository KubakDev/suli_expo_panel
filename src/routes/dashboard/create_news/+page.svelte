<script lang="ts">
	import { Label, Input, Fileupload, Textarea, ButtonGroup, InputAddon } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/newsStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { NewsModel, NewsModelLang } from '../../../models/newsModel';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { createCarouselImages } from '$lib/utils/createCarouselImages';

	export let data;

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

	function handleSelectChange(event: any) {
		const selectedValue = event.target.value;

		if (selectedValue === 'Select Type') {
			delete newsObject.exhibition_id;
		} else {
			newsObject.exhibition_id = selectedValue;
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

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">News Data</h1></div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload News Image</Label>
					<Fileupload
						on:change={handleFileUploadThumbnail}
						accept=".jpg, .jpeg, .png"
						class=" dark:bg-white"
					/>

					{#if isFormSubmitted && !newsObject.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>

			<div class="col-span-1">
				<InsertExhibitionType {handleSelectChange} {data} />
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<span>Date</span>
					<Input type="date" bind:value={newsObject.created_at} />
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form class="">
					<Tabs contentClass="dark:bg-gray-900">
						{#each newsDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-5 py-16">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl text-gray-700 dark:text-gray-300 font-bold">
											{#if langData.language === 'ar'}
												{`أضف البيانات إلى اللغة العربية`}
											{:else if langData.language === 'ckb'}
												{`زیاد کردنی داتا بە زمانی کوردی`}
											{:else}
												Add data for <span class="uppercase">{`${langData.language}`}</span> language
											{/if}
										</h1>
										<p>for other language navigate between tabs</p>
									</div>
									<div class="pb-10">
										<Label for="title" class="mb-2">News Title</Label>
										<Input
											type="text"
											placeholder="Enter title"
											bind:value={langData.title}
											id="title"
											name="title"
										/>
										{#if isFormSubmitted && !langData.title.trim()}
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
										{#if isFormSubmitted && !langData.short_description.trim()}
											<p class="error-message">Please enter a short description</p>
										{/if}
									</div>

									<div class="">
										<Label for="textarea-id" class="mb-2">News detail</Label>
										<div class="w-full" style="height: 400px;">
											<EditorComponent {langData} {isFormSubmitted} />
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</form>
				<!-- upload news image -->
				<Label for="images" class="mb-2 px-8">Upload Image File</Label>
				<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
				{#if isFormSubmitted && sliderImagesFile.length === 0}
					<p class="error-message px-8">Please upload at least one image for the slider</p>
				{/if}

				<!-- upload news image -->

				<!-- submit Form -->
				<div class="w-full flex justify-end py-5 px-10">
					<button
						on:click|preventDefault={formSubmit}
						type="submit"
						class="bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
					>
						Add
					</button>
				</div>
			</div>
			<div class="lg:col-span-1 border rounded-lg dark:border-gray-600">
				<Tabs style="underline" contentClass="dark:bg-gray-900 rounded-lg ">
					<TabItem open title="News List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each newsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={newsObject.thumbnail}
											primaryColor="bg-primary"
											date={newsObject.created_at}
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
