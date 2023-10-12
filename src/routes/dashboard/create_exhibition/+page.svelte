<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/exhibitionStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ExhibitionsModel, ExhibitionsModelLang } from '../../../models/exhibitionModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import { decodeBase64 } from '$lib/utils/decodeBase64';
	import { createCarouselImages } from '$lib/utils/createCarouselImages';

	export let data;

	let isFormSubmitted = false;
	let showToast = false;
	let fileName: string;
	let fileName_map: string;
	let fileName_pdf: any[] = [];
	let fileName_pdf_contract: any[] = [];
	let fileName_brochure: any[] = [];
	let imageFile: File | undefined;
	let imageFile_map: File | undefined;
	let imageFile_pdf: File | undefined;
	let imageFile_pdf_contract: File | undefined;
	let imageFile_brochure: File | undefined;
	let sliderImagesFile: File[] = [];
	let sliderImagesFile_sponsor: File[] = [];
	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};

	let carouselImages: CarouselImage[] | undefined = undefined;
	let carouselImages_sponsor: CarouselImage[] | undefined = undefined;

	let selectedLanguageTab = LanguageEnum.EN;

	let exhibitionsDataLang: ExhibitionsModelLang[] = [];
	let exhibitionsObject: ExhibitionsModel = {
		images: [],
		thumbnail: '',
		image_map: '',
		country_number: 0,
		company_number: 0,
		exhibition_type: '',
		deleted_status: '',
		sponsor_images: [],
		sponsor_title: '',
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
			pdf_files: '',
			contract_file: '',
			description: '',
			location: '',
			location_title: '',
			brochure: '',
			map_title: '',
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}
	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		getImagesObject();
	} //**dropzone**//

	//**dropzone-sponsor**//
	function getAllImageFile_sponsor(e: { detail: File[] }) {
		sliderImagesFile_sponsor = e.detail;
		getImagesObject_sponsor();
	} //**dropzone-sponsor**//

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidExhibitionsObject = false;

		for (let lang of exhibitionsDataLang) {
			const storyData = lang.story.trim();
			const title = lang.title.trim();
			const shortDescription = lang.description.trim();
			const link = lang.video_youtube_link.trim();
			const location = lang.location.trim();
			const location_title = lang.location_title.trim();
			const mapTitle = lang.map_title.trim();

			const isStoryIsEmpty = isEmpty(storyData);
			const isTitleEmpty = isEmpty(title);
			const isShortDescriptionEmpty = isEmpty(shortDescription);
			const isLinkEmpty = isEmpty(link);
			const isLinkEmptyLocation = isEmpty(location);
			const isLinkEmptyLocation_title = isEmpty(location_title);
			const isMapTitle = isEmpty(mapTitle);

			if (
				!isEmpty(lang.pdf_files) ||
				!isEmpty(lang.brochure) ||
				!isStoryIsEmpty ||
				!isTitleEmpty ||
				!isShortDescriptionEmpty ||
				!isLinkEmpty ||
				!isLinkEmptyLocation ||
				!isMapTitle ||
				!isLinkEmptyLocation_title
			) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (
					isEmpty(lang.pdf_files) ||
					isEmpty(lang.brochure) ||
					isStoryIsEmpty ||
					isTitleEmpty ||
					isShortDescriptionEmpty ||
					isLinkEmpty ||
					isLinkEmptyLocation ||
					isMapTitle ||
					isLinkEmptyLocation_title
				) {
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
			sliderImagesFile_sponsor.length > 0 &&
			!isEmpty(exhibitionsObject.company_number) &&
			!isEmpty(exhibitionsObject.country_number) &&
			!isEmpty(exhibitionsObject.sponsor_title) &&
			!isEmpty(exhibitionsObject.exhibition_type)
		) {
			isValidExhibitionsObject = true;
		}

		if (!hasDataForLanguage || !isValidExhibitionsObject) {
			isFormSubmitted = true;
			return;
		}

		showToast = true;

		// Upload exhibition thumbnail image
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		exhibitionsObject.thumbnail = response.data?.path || '';

		// Upload exhibition  image map
		const response2 = await data.supabase.storage
			.from('image')
			.upload(`${fileName_map}`, imageFile_map!);
		exhibitionsObject.image_map = response2.data?.path || '';

		for (let file of fileName_pdf) {
			const responsePDF = await data.supabase.storage
				.from('PDF')
				.upload(`pdfFiles/${file.fileName}`, file.file!);

			const langObj = exhibitionsDataLang.find((lang) => lang.language === file.lang);
			if (langObj) {
				langObj.pdf_files = responsePDF?.data?.path || '';
			}
		}

		for (let file of fileName_pdf_contract) {
			const responsePDF_contract = await data.supabase.storage
				.from('PDF')
				.upload(`pdfFiles/${file.fileName}`, file.file!);

			const langObj = exhibitionsDataLang.find((lang) => lang.language === file.lang);
			if (langObj) {
				langObj.contract_file = responsePDF_contract?.data?.path || '';
			}
		}

		for (let file of fileName_brochure) {
			const response3 = await data.supabase.storage
				.from('image')
				.upload(`exhibition/${file.fileName}`, file.file!);

			const langObj = exhibitionsDataLang.find((lang) => lang.language === file.lang);
			if (langObj) {
				langObj.brochure = response3?.data?.path || '';
			}
		}

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`exhibition/${randomText}`, image!)
				.then((response) => {
					if (response.data) {
						if (Array.isArray(exhibitionsObject.images)) {
							exhibitionsObject.images.push(response.data.path);
						}
					}
				});
		}

		for (let image of sliderImagesFile_sponsor) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`exhibition/${randomText}`, image!)
				.then((response) => {
					if (response.data) {
						exhibitionsObject.sponsor_images.push(response.data.path);
					}
				});
		}

		// Convert exhibitionsObject.images and exhibitionsObject.pdf_files to valid array string format
		let imagesArray: string[] = [];
		if (Array.isArray(exhibitionsObject.images)) {
			imagesArray = exhibitionsObject.images.map((image) => `"${image}"`);
		}
		exhibitionsObject.images = `{${imagesArray.join(',')}}`;

		let imagesArray_sponsor: string[] = [];
		if (Array.isArray(exhibitionsObject.sponsor_images)) {
			imagesArray_sponsor = exhibitionsObject.sponsor_images.map((image) => `"${image}"`);
		}
		exhibitionsObject.sponsor_images = `{${imagesArray_sponsor.join(',')}}`;

		// Insert data into Supabase

		insertData(exhibitionsObject, exhibitionsDataLang, data.supabase);

		resetForm();
		goto('/dashboard/exhibition');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		exhibitionsObject = {
			images: [],
			image_map: '',
			thumbnail: '',
			country_number: 0,
			company_number: 0,
			exhibition_type: '',
			deleted_status: '',
			sponsor_images: [],
			sponsor_title: '',
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
				location: '',
				location_title: '',
				pdf_files: '',
				contract_file: '',
				brochure: '',
				map_title: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleFileUploadThumbnail(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			exhibitionsObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber();
			fileName = `exhibition/${randomText}`;
		};

		reader.readAsDataURL(file);
	}
	function handleFileUploadMap(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile_map = file;
		const reader = new FileReader();

		reader.onloadend = () => {
			exhibitionsObject.image_map = reader.result as '';
			const randomText = getRandomTextNumber();
			fileName_map = `exhibition/${randomText}`;
		};

		reader.readAsDataURL(file);
	}

	// handle brochure
	function handleFileUpload_brochure(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];

		imageFile_brochure = file;

		const lang = selectedLanguageTab;

		const reader = new FileReader();

		reader.onloadend = () => {
			for (let lang of exhibitionsDataLang) {
				if (lang.language === selectedLanguageTab) {
					lang.brochure = reader.result as '';
				}
			}

			const randomText = getRandomTextNumber();
			fileName_brochure.push({
				lang: selectedLanguageTab,
				fileName: `${randomText}`,
				file: file
			});

			exhibitionsDataLang = [...exhibitionsDataLang];
		};

		reader.readAsDataURL(file);
	}

	function handleFileUpload_pdf(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile_pdf = file;
		//

		const lang = selectedLanguageTab; // Get the selected language

		const reader = new FileReader();

		reader.onloadend = () => {
			for (let lang of exhibitionsDataLang) {
				if (lang.language === selectedLanguageTab) {
					lang.pdf_files = reader.result as '';
				}
			}

			const randomText = getRandomTextNumber();
			fileName_pdf.push({
				lang: selectedLanguageTab,
				fileName: `${randomText}`,
				file: file
			});
		};

		reader.readAsDataURL(file);
	}

	function handleFileUpload_pdf_contract(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile_pdf_contract = file;

		const lang = selectedLanguageTab; // Get the selected language

		const reader = new FileReader();

		reader.onloadend = () => {
			for (let lang of exhibitionsDataLang) {
				if (lang.language === selectedLanguageTab) {
					lang.contract_file = reader.result as '';
				}
			}

			const randomText = getRandomTextNumber();
			fileName_pdf_contract.push({
				lang: selectedLanguageTab,
				fileName: `${randomText}`,
				file: file
			});
		};

		reader.readAsDataURL(file);
	}

	function getImagesObject() {
		carouselImages = createCarouselImages(sliderImagesFile);

		if (carouselImages.length <= 0) {
			carouselImages = undefined;
		}
	}
	function getImagesObject_sponsor() {
		carouselImages_sponsor = createCarouselImages(sliderImagesFile_sponsor);

		if (carouselImages_sponsor.length <= 0) {
			carouselImages_sponsor = undefined;
		}
	}
</script>

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">Exhibition Data</h1></div>

		<div class="grid lg:grid-cols-12 gap-4 px-4 py-2">
			<div class="col-span-4">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Exhibition Image</Label>
					<Fileupload
						on:change={handleFileUploadThumbnail}
						accept=".jpg, .jpeg, .png"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !exhibitionsObject.thumbnail.trim()}
						<p class="error-message text-sm font-normal">Please Upload an Image</p>
					{/if}
				</Label>
			</div>

			<div class="col-span-4">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail_map" class="mb-2">Upload Image Map</Label>
					<Fileupload
						on:change={handleFileUploadMap}
						accept=".jpg, .jpeg, .png"
						class=" dark:bg-white"
						lang={selectedLanguageTab}
					/>
				</Label>
			</div>

			<div class="col-span-2">
				<Label class="space-y-2 mb-2">
					<span>Start Date</span>
					<Input type="date" bind:value={exhibitionsObject.start_date} />
				</Label>
			</div>
			<div class="col-span-2">
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
					<p class="error-message text-sm font-normal">Please enter an exhibition type</p>
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
						<p class="error-message text-sm font-normal">Required</p>
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
						<p class="error-message text-sm font-normal">Required</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form>
					<Tabs contentClass="dark:bg-gray-900 px-4">
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
									<div class="pb-5 flex flex-col lg:flex-row gap-4 col-span-1">
										<Label class="lg:w-1/3 space-y-2 mb-2">
											<span>Upload pdf file </span>

											<Fileupload
												on:change={handleFileUpload_pdf}
												accept=".pdf"
												class=" dark:bg-white"
												placeholder="Upload"
											/>

											{#if isFormSubmitted && !langData?.pdf_files?.trim()}
												<p class="error-message text-sm font-normal">Please Upload an pdf file</p>
											{/if}

											<div>
												<button
													on:click={() => decodeBase64(langData?.pdf_files ?? '')}
													class="cursor-pointer text-xs hover:text-red-700 text-gray-600"
													>Click here to view the PDF</button
												>
											</div>
										</Label>

										<Label class="lg:w-1/3 space-y-2 mb-2">
											<span>Upload brochure image</span>

											<Fileupload
												on:change={handleFileUpload_brochure}
												accept=".svg, .png, .jpg, .jpeg"
												class=" dark:bg-white"
												placeholder="Upload"
											/>

											{#if isFormSubmitted && !langData?.brochure?.trim()}
												<p class="error-message text-sm font-normal">
													Please Upload brochure image
												</p>
											{/if}
										</Label>

										<Label class="lg:w-1/3 space-y-2 mb-2">
											<span>Upload pdf contract </span>

											<Fileupload
												on:change={handleFileUpload_pdf_contract}
												accept=".pdf"
												class="dark:bg-white"
												placeholder="Upload"
											/>

											<div>
												<button
													on:click={() => decodeBase64(langData?.contract_file ?? '')}
													class="cursor-pointer text-xs hover:text-red-700 text-gray-600"
													>Click here to view the PDF</button
												>
											</div>
										</Label>
									</div>

									<div class="pb-0 flex gap-3 col-span-1">
										<Label class="w-2/4 space-y-2 mb-2">
											<Label for="title" class="mb-2">Link for youtube video</Label>
											<Input
												type="text"
												bind:value={langData.video_youtube_link}
												placeholder="Enter a link"
											/>
											{#if isFormSubmitted && !langData.video_youtube_link}
												<p class="error-message text-sm font-normal">
													Please enter a link for youtube video
												</p>
											{/if}
										</Label>

										<Label class="w-2/4 space-y-2 mb-2">
											<Label for="title" class="mb-2">Map Title</Label>
											<Input
												type="text"
												placeholder="Enter map title"
												bind:value={langData.map_title}
												id="title"
												name="title"
											/>
											{#if isFormSubmitted && !langData.map_title}
												<p class="error-message text-sm font-normal">Please enter map title</p>
											{/if}

											<div>
												<button
													on:click={() => decodeBase64(langData?.pdf_files ?? '')}
													class="cursor-pointer text-xs hover:text-red-700 text-gray-600"
													>Click here to view the PDF</button
												>
											</div>
										</Label>
									</div>

									<div class="pb-5 flex gap-3 col-span-1">
										<Label class="w-2/3 space-y-2 mb-2">
											<span>Location</span>
											<Input
												type="text"
												bind:value={langData.location}
												placeholder="Enter location"
											/>
											{#if isFormSubmitted && !langData.location}
												<p class="error-message text-sm font-normal">Please enter a location</p>
											{/if}
										</Label>
										<Label class="w-1/3 space-y-2 mb-2">
											<span>Title for location</span>
											<Input
												type="text"
												bind:value={langData.location_title}
												placeholder="Enter location title"
											/>
											{#if isFormSubmitted && !langData.location_title}
												<p class="error-message text-sm font-normal">
													Please enter a location_title
												</p>
											{/if}
										</Label>
									</div>

									<div class="pb-5">
										<Label for="title" class="mb-2">Exhibition Title</Label>
										<Input
											type="text"
											placeholder="Exhibition title"
											bind:value={langData.title}
											id="title"
											name="title"
										/>
										{#if isFormSubmitted && !langData.title.trim()}
											<p class="error-message text-sm font-normal">Please enter a title</p>
										{/if}
									</div>
									<div class="pb-5">
										<Label for="story" class="mb-2">Exhibition Story</Label>
										<Textarea
											placeholder="Enter story"
											rows="3"
											bind:value={langData.story}
											id="story"
											name="story"
										/>
										{#if isFormSubmitted && !langData.story.trim()}
											<p class="error-message text-sm font-normal">Please enter a story</p>
										{/if}
									</div>

									<div class="pb-5">
										<Label for="textarea-id" class="mb-2">Short description</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.description}
											id="short_description"
											name="short_description"
										/>
										{#if isFormSubmitted && !langData.description.trim()}
											<p class="error-message text-sm font-normal">Please enter a description</p>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border mb-2 dark:border-gray-700 mx-10" />
				</form>

				<div class="px-8 pt-5">
					<Label for="textarea-id" class="mb-2">Sponsor title</Label>
					<Input
						type="text"
						bind:value={exhibitionsObject.sponsor_title}
						placeholder="sponsor title"
					/>
					{#if isFormSubmitted && !exhibitionsObject.sponsor_title.trim()}
						<p class="error-message text-sm font-normal">Please enter a title for sponsor</p>
					{/if}
				</div>
				<div class="grid lg:grid-cols-2 pt-5">
					<!-- upload exhibition image -->
					<Label class="space-y-2 mb-2 ">
						<Label for="image" class="mb-2 px-8">Upload Image Files</Label>
						<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
						{#if isFormSubmitted && sliderImagesFile.length === 0}
							<p class="error-message text-sm font-normal px-8">
								Please upload at least one image for the slider
							</p>
						{/if}
					</Label>

					<!-- upload sponsor image -->
					<Label class="space-y-2 mb-2">
						<Label for="image" class=" px-8">Upload Sponsor Images</Label>
						<FileUploadComponent on:imageFilesChanges={getAllImageFile_sponsor} />
						{#if isFormSubmitted && sliderImagesFile_sponsor.length === 0}
							<p class="error-message text-sm font-normal px-8">
								Please upload at least one image for the sponsor
							</p>
						{/if}
					</Label>
					<!-- upload sponsor image -->
				</div>

				<div class="py-2" />

				<!-- submit Form -->
				<div class="w-full flex justify-end pb-5 px-10">
					<button
						on:click|preventDefault={formSubmit}
						type="submit"
						class="bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
					>
						Add
					</button>
				</div>
			</div>

			<div>
				<div class="lg:col-span-1 border rounded-lg dark:border-gray-600">
					<Tabs style="underline" contentClass="dark:bg-gray-900 rounded-lg ">
						<TabItem open title="Exhibition Image">
							<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
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
						<TabItem open title="Map">
							<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
								<div class="flex justify-start items-start">
									{#each exhibitionsDataLang as langData}
										{#if langData.language === selectedLanguageTab}
											<ExpoCard
												cardType={CardType.Main}
												title={langData.title}
												short_description=""
												thumbnail={exhibitionsObject.image_map}
												primaryColor="bg-primary"
												startDate=""
												endDate=""
											/>
										{/if}
									{/each}
								</div>

								<div />
							</div>
						</TabItem>
						<TabItem open title="Brochure">
							<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
								<div class="flex justify-start items-start">
									{#each exhibitionsDataLang as langData}
										{#if langData.language === selectedLanguageTab}
											<ExpoCard
												cardType={CardType.Flat}
												title=""
												short_description=""
												thumbnail={langData.brochure ?? ''}
												primaryColor="bg-primary"
												startDate=""
												endDate=""
											/>
										{/if}
									{/each}
								</div>

								<div />
							</div>
						</TabItem>
						<TabItem title="Detail">
							{#each exhibitionsDataLang as langData}
								{#if langData.language === selectedLanguageTab}
									<DetailPage cardType={CardType.Flat} imagesCarousel={carouselImages} />
								{/if}
							{/each}
						</TabItem>
						<TabItem title="Sponsors">
							{#each exhibitionsDataLang as langData}
								{#if langData.language === selectedLanguageTab}
									<DetailPage cardType={CardType.Flat} imagesCarousel={carouselImages_sponsor} />
								{/if}
							{/each}
						</TabItem>
					</Tabs>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.error-message {
		color: red;
	}
</style>
