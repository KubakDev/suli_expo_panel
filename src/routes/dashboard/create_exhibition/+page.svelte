<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/exhibitionStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ExhibitionsModel, ExhibitionsModelLang } from '../../../models/exhibitionModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import PDFUploadComponent from '$lib/components/pdfUpload.svelte';
	//@ts-ignore
	import { isLength, isEmpty } from 'validator';

	export let data;
	let isFormSubmitted = false;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;
	let pdfFiles: File[] = [];

	let exhibitionsDataLang: ExhibitionsModelLang[] = [];

	let exhibitionsObject: ExhibitionsModel = {
		images: [],
		pdf_files: [],
		thumbnail: '',
		country_number: 0,
		company_number: 0,
		exhibition_type: '',
		start_date: new Date(),
		end_date: new Date(),
		id: 0
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		exhibitionsDataLang.push({
			story: '',
			video_youtube_link: '',
			title: '',
			description: '',
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
			exhibitionsObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `exhibitions/${randomText}_${file.name}`; // Append random text to the file name
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

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidExhibitionsObject = false;

		for (let lang of exhibitionsDataLang) {
			const storyData = lang.story.trim();
			const title = lang.title.trim();
			const shortDescription = lang.description.trim();
			const link = lang.video_youtube_link.trim();

			const isStoryIsEmpty = isEmpty(storyData);
			const isTitleEmpty = isEmpty(title);
			const isShortDescriptionEmpty = isEmpty(shortDescription);
			const isLinkEmpty = isEmpty(link);

			if (!isStoryIsEmpty || !isTitleEmpty || !isShortDescriptionEmpty || !isLinkEmpty) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (isStoryIsEmpty || isTitleEmpty || isShortDescriptionEmpty || isLinkEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		// Check if galleryObject has a valid thumbnail and at least one slider image
		if (
			!isEmpty(exhibitionsObject.thumbnail) &&
			sliderImagesFile.length > 0 &&
			!isEmpty(exhibitionsObject.company_number) &&
			!isEmpty(exhibitionsObject.country_number) &&
			!isEmpty(exhibitionsObject.exhibition_type)
		) {
			isValidExhibitionsObject = true;
		}

		if (!hasDataForLanguage || !isValidExhibitionsObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		// Upload exhibition thumbnail image
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		exhibitionsObject.thumbnail = response.data?.path || '';

		// Upload PDF files
		for (let pdf of pdfFiles) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('PDF')
				.upload(`pdfFiles/${randomText}_${pdf.name}`, pdf)
				.then((response) => {
					if (response.data) {
						exhibitionsObject.pdf_files.push(response.data.path);
					}
				});
		}

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`exhibitions/${randomText}_${image.name}`, image!)
				.then((response) => {
					if (response.data) {
						exhibitionsObject.images.push(response.data.path);
					}
				});
		}

		// Convert exhibitionsObject.images and exhibitionsObject.pdf_files to valid array string format
		const imagesArray = exhibitionsObject.images.map((image) => `"${image}"`);
		const pdfFilesArray = exhibitionsObject.pdf_files.map((pdf) => `"${pdf}"`);
		exhibitionsObject.images = `{${imagesArray.join(',')}}`;
		exhibitionsObject.pdf_files = `{${pdfFilesArray.join(',')}}`;

		// Insert data into Supabase
		insertData(exhibitionsObject, exhibitionsDataLang, data.supabase);

		resetForm();
		goto('/dashboard/exhibition');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		exhibitionsObject = {
			images: [],
			pdf_files: [],
			thumbnail: '',
			country_number: 0,
			company_number: 0,
			exhibition_type: '',
			start_date: new Date(),
			end_date: new Date(),
			id: 0
		};

		exhibitionsDataLang = []; // Resetting exhibitionDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			exhibitionsDataLang.push({
				story: '',
				video_youtube_link: '',
				title: '',
				description: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
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
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">Exhibition Data</h1></div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 py-2">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Exhibition Image</Label>
					<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					{#if isFormSubmitted && !exhibitionsObject.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<span>Start Date</span>
					<Input type="date" bind:value={exhibitionsObject.start_date} />
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<span>End Date</span>
					<Input type="date" bind:value={exhibitionsObject.end_date} />
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-12 gap-4 px-4 py-2">
			<div class="col-span-4">
				<Label for="default-input" class="block mb-2">Exhibition Type</Label>
				<Input bind:value={exhibitionsObject.exhibition_type} placeholder="Enter Exhibition Type" />
				{#if isFormSubmitted && !exhibitionsObject.exhibition_type.trim()}
					<p class="error-message">Please enter an exhibition type</p>
				{/if}
			</div>

			<div class="col-span-2">
				<Label class="space-y-2 mb-2">
					<span>Country No</span>
					<Input
						type="number"
						bind:value={exhibitionsObject.country_number}
						placeholder="Enter a number"
					/>
					{#if isFormSubmitted && !exhibitionsObject.country_number}
						<p class="error-message">Required</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-2">
				<Label class="space-y-2 mb-2">
					<span>Company No</span>
					<Input
						type="number"
						bind:value={exhibitionsObject.company_number}
						placeholder="Enter a number"
					/>
					{#if isFormSubmitted && !exhibitionsObject.company_number}
						<p class="error-message">Required</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 border rounded-lg">
				<form>
					<Tabs>
						{#each exhibitionsDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-5 py-10">
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
										<Label class="space-y-2 mb-2">
											<span>Link for youtube video</span>
											<Input
												type="text"
												bind:value={langData.video_youtube_link}
												placeholder="Enter a link"
											/>
											{#if isFormSubmitted && !langData.video_youtube_link}
												<p class="error-message">Please enter a link for youtube video</p>
											{/if}
										</Label>
									</div>
									<div class="pb-10">
										<Label for="title" class="mb-2">Exhibition Title</Label>
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
										<Label for="story" class="mb-2">Exhibition Story</Label>
										<Textarea
											placeholder="Enter story"
											rows="3"
											bind:value={langData.story}
											id="story"
											name="story"
										/>
										{#if isFormSubmitted && !langData.story.trim()}
											<p class="error-message">Please enter a story</p>
										{/if}
									</div>

									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">Short description</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.description}
											id="short_description"
											name="short_description"
										/>
										{#if isFormSubmitted && !langData.description.trim()}
											<p class="error-message">Please enter a description</p>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border mb-2 border-gray-300 mx-10" />

					<!-- upload Exhibition image -->
					<div class="grid lg:grid-cols-2 gap-4 px-8 pt-5">
						<Label class="space-y-2 mb-2">
							<Label for="pdf_file" class="mb-2">Upload exhibition Image</Label>
							<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
							{#if isFormSubmitted && sliderImagesFile.length === 0}
								<p class="error-message">Please upload at least one image for the slider</p>
							{/if}
						</Label>
						<!-- upload pdf file -->
						<Label class="space-y-2 mb-2">
							<Label for="first_name" class="mb-2">Upload PDF Files</Label>
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
				</form>
			</div>
			<div class="lg:col-span-1 border rounded-lg">
				<Tabs style="underline" class="bg-secondary rounded-tl rounded-tr">
					<TabItem open title="Exhibition List">
						<div
							class=" w-full rounded-md p-10 flex justify-center items-start"
							style="min-height: calc(100vh - 300px);"
						>
							<div class="flex justify-start items-start">
								{#each exhibitionsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.description}
											thumbnail={exhibitionsObject.thumbnail}
											primaryColor="bg-primary"
											startDate={exhibitionsObject.start_date}
											endDate={exhibitionsObject.end_date}
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
					</TabItem>
					<TabItem title="Exhibition Detail">
						{#each exhibitionsDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<DetailPage imagesCarousel={carouselImages} long_description="" />
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
