<script lang="ts">
	import {
		Label,
		Button,
		Input,
		Fileupload,
		Textarea,
		Select,
		ButtonGroup,
		InputAddon
	} from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/magazineStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { MagazineModel, MagazineModelLang } from '../../../models/magazineModel';
	import { onMount } from 'svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import PDFUploadComponent from '$lib/components/pdfUpload.svelte';
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	//@ts-ignore
	import { isLength, isEmpty } from 'validator';

	export let data;
	let isFormSubmitted = false;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let pdfFiles: File[] = [];
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let magazineDataLang: MagazineModelLang[] = [];

	let magazineObject: MagazineModel = {
		images: [],
		thumbnail: '',
		pdf_files: [],
		created_at: new Date(),
		id: 0
	};

	let exhibitionData: ExhibitionModel[] = [];
	const fetchData = async () => {
		try {
			exhibitionData = await getDataExhibition(data.supabase);

			let uniqueTypes = exhibitionData.filter((item, index, array) => {
				return !array
					.slice(0, index)
					.some((prevItem) => prevItem.exhibition_type === item.exhibition_type);
			});
			exhibitionData = uniqueTypes;
			console.log(uniqueTypes);
		} catch (error) {
			console.error(error);
		}
	};

	onMount(fetchData);
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		magazineDataLang.push({
			title: '',
			short_description: '',
			long_description: '',
			created_at: new Date(),
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			magazineObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `magazine/${randomText}_${file.name}`; // Append random text to the file name
		};

		reader.readAsDataURL(file);
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
		let isValidMagazineObject = false;

		for (let lang of magazineDataLang) {
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
		if (!isEmpty(magazineObject.thumbnail) && sliderImagesFile.length > 0) {
			isValidMagazineObject = true;
		}

		if (!hasDataForLanguage || !isValidMagazineObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		// Upload magazine thumbnail image
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		magazineObject.thumbnail = response.data?.path || '';

		// Upload PDF files
		for (let pdf of pdfFiles) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('PDF')
				.upload(`pdfFiles/${randomText}_${pdf.name}`, pdf)
				.then((response) => {
					if (response.data) {
						magazineObject.pdf_files.push(response.data.path);
					}
				});
		}

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`magazine/${randomText}_${image.name}`, image!)
				.then((response) => {
					if (response.data) {
						magazineObject.images.push(response.data.path);
					}
				});
		}

		// Convert magazineObject.images and magazineObject.pdf_files to valid array string format
		const imagesArray = magazineObject.images.map((image) => `"${image}"`);
		const pdfFilesArray = magazineObject.pdf_files.map((pdf) => `"${pdf}"`);
		magazineObject.images = `{${imagesArray.join(',')}}`;
		magazineObject.pdf_files = `{${pdfFilesArray.join(',')}}`;

		// Insert data into Supabase
		insertData(magazineObject, magazineDataLang, data.supabase);

		resetForm();
		goto('/dashboard/magazine');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		magazineObject = {
			images: [],
			thumbnail: '',
			pdf_files: [],
			exhibition_type: '',
			created_at: new Date(),
			id: 0
		};

		magazineDataLang = []; // Resetting magazineDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			magazineDataLang.push({
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
		console.log(event.target);
		if (selectedValue === 'Select Type') {
			delete magazineObject.exhibition_id;
		} else {
			magazineObject.exhibition_id = selectedValue;
		}
	}

	function getImagesObject() {
		carouselImages = sliderImagesFile.map((image, i) => {
			const imgUrl = URL.createObjectURL(image);
			return {
				id: i,
				imgurl: imgUrl,
				name: image,
				attribution: ''
			};
		});
		// console.log('test//', carouselImages);

		if (carouselImages.length <= 0) {
			carouselImages = undefined;
		}
	}
</script>

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">Magazine Data</h1></div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Magazine Image</Label>
					<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					{#if isFormSubmitted && !magazineObject.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<div class="mb-6">
					<Label for="website-admin" class="block mb-2">Exhibition Type</Label>
					<ButtonGroup class="w-full">
						<select
							class="border border-gray-300 rounded-l-md w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
							id="type"
							name="type"
							on:change={handleSelectChange}
						>
							<option>Select Type</option>
							{#each exhibitionData as exhibition}
								<option value={exhibition.id}>{exhibition.exhibition_type}</option>
							{/each}
						</select>
						<InputAddon class="bg-white">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
								<path d="M0 0h24v24H0z" fill="none" />
								<path
									d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 2v3H6V4h12zM5 20V9h14v11H5zm3-7h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
								/>
							</svg>
						</InputAddon>
					</ButtonGroup>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 border rounded-lg">
				<form>
					<Tabs>
						{#each magazineDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-5 py-16">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl text-gray-700 font-bold">
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
										<Label for="title" class="mb-2">Magazine Title</Label>
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
										<Label for="textarea-id" class="mb-2">Magazine detail</Label>
										<div class="w-full" style="height: 400px;">
											<EditorComponent {langData} {isFormSubmitted} />
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border mb-2 border-gray-300 mx-10" />
				</form>

				<!-- upload Magazine image -->
				<div class="grid lg:grid-cols-2 pt-5">
					<Label class="space-y-2 mb-2">
						<Label for="image" class="mb-2 px-8">Upload Magazine Image</Label>
						<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
						{#if isFormSubmitted && sliderImagesFile.length === 0}
							<p class="error-message px-8">Please upload at least one image for the slider</p>
						{/if}
					</Label>
					<!-- upload pdf file -->
					<Label class="space-y-2 mb-2">
						<Label for="image" class="mb-2 px-8">Upload PDF Files</Label>
						<PDFUploadComponent on:imageFilesChanges={getAllPDFFile} />
					</Label>
				</div>

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
			<div class="lg:col-span-1 border rounded-lg">
				<Tabs style="underline" class="bg-secondary rounded-tl rounded-tr">
					<TabItem open title="Magazine List">
						<div
							class=" w-full rounded-md p-10 flex justify-center items-start"
							style="min-height: calc(100vh - 300px);"
						>
							<div class="flex justify-start items-start">
								{#each magazineDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={magazineObject.thumbnail}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
					</TabItem>
					<TabItem title="Magazine Detail">
						{#each magazineDataLang as langData}
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
