<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/exhibitionStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ExhibitionsModel } from '../../../models/exhibitionModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import { decodeBase64 } from '$lib/utils/decodeBase64';
	import { createCarouselImages } from '$lib/utils/createCarouselImages';
	import { IconEye, IconX, IconDeviceFloppy, IconChevronDown } from '@tabler/icons-svelte';
	const placeholderImage = '/images/placeholder.png';

	export let data;

	interface FileWithLang {
		fileName: string;
		file: File;
		lang: LanguageEnum;
	}

	// Extended ExhibitionsModelLang interface
	interface ExhibitionsModelLang {
		story: string;
		video_youtube_link: string;
		title: string;
		pdf_files: string;
		contract_file: string;
		description: string;
		location: string;
		location_title: string;
		brochure: string;
		map_title: string;
		language: LanguageEnum;
		storyOpen?: boolean;
		descriptionOpen?: boolean;
	}

	let isFormSubmitted = false;
	let showToast = false;
	let fileName: string;
	let fileName_map: string;
	let fileName_pdf: FileWithLang[] = [];
	let fileName_pdf_contract: FileWithLang[] = [];
	let fileName_brochure: FileWithLang[] = [];
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
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum],
			storyOpen: false,
			descriptionOpen: false
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
						if (!Array.isArray(exhibitionsObject.images)) {
							exhibitionsObject.images = [];
						}
						exhibitionsObject.images.push(response.data.path);
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
						if (!Array.isArray(exhibitionsObject.sponsor_images)) {
							exhibitionsObject.sponsor_images = [];
						}
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

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">New exhibition has been created successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Create Exhibition</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Enter exhibition details and upload media files</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Image</span>
						<div class="relative">
							{#if exhibitionsObject.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											exhibitionsObject.thumbnail = '';
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
								class="dark:bg-white"
							/>
						</div>
						{#if isFormSubmitted && !exhibitionsObject.thumbnail.trim()}
							<p class="error-message mt-2">Please upload an image</p>
						{/if}
					</Label>
				</div>
			</div>
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Map Image</span>
						<div class="relative">
							{#if exhibitionsObject.image_map}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											exhibitionsObject.image_map = '';
											imageFile_map = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={handleFileUploadMap}
								accept=".jpg, .jpeg, .png .svg"
								class="dark:bg-white"
								lang={selectedLanguageTab}
							/>
						</div>
					</Label>
				</div>
			</div>
		</div>

		<!-- Date section combined in a single row -->
		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-12">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div class="md:col-span-1">
							<Label class="block mb-2">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
								<Input bind:value={exhibitionsObject.exhibition_type} placeholder="Enter Exhibition Type" class="w-full" />
								{#if isFormSubmitted && !exhibitionsObject.exhibition_type.trim()}
									<p class="error-message mt-2">Please enter an exhibition type</p>
								{/if}
							</Label>
						</div>
						<div class="md:col-span-1">
							<Label class="block mb-2">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Start Date</span>
								<Input type="date" bind:value={exhibitionsObject.start_date} class="w-full" />
							</Label>
						</div>
						<div class="md:col-span-1">
							<Label class="block mb-2">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">End Date</span>
								<Input type="date" bind:value={exhibitionsObject.end_date} class="w-full" />
							</Label>
						</div>
						<div class="md:col-span-1">
							<Label class="block mb-2">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Country / Company</span>
								<div class="grid grid-cols-2 gap-2">
									<Input
										type="number"
										bind:value={exhibitionsObject.country_number}
										placeholder="Country #"
										min="0"
										class="w-full"
									/>
									<Input
										type="number"
										bind:value={exhibitionsObject.company_number}
										placeholder="Company #"
										min="0"
										class="w-full"
									/>
								</div>
								{#if isFormSubmitted && (!exhibitionsObject.country_number || !exhibitionsObject.company_number)}
									<p class="error-message mt-2">Both fields required</p>
								{/if}
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
							{#each exhibitionsDataLang as langData}
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

										<!-- PDF and Brochure Files -->
										<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<div class="flex items-center justify-between mb-2">
														<span class="font-medium text-gray-700 dark:text-gray-300">PDF File</span>
														{#if langData.pdf_files}
															<div class="flex space-x-2">
																<button
																	on:click={() => decodeBase64(langData?.pdf_files ?? '')}
																	class="cursor-pointer text-xs inline-flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary-dark rounded-full text-white transition-colors duration-200"
																	>
																	<IconEye size={16} />
																	View PDF
																</button>
															</div>
														{/if}
													</div>
													<Fileupload
														on:change={handleFileUpload_pdf}
														accept=".pdf"
														class="dark:bg-white"
													/>
													{#if isFormSubmitted && !langData?.pdf_files?.trim()}
														<p class="error-message mt-2">Please upload PDF file</p>
													{/if}
												</Label>
											</div>

											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<div class="flex items-center justify-between mb-2">
														<span class="font-medium text-gray-700 dark:text-gray-300">Brochure</span>
													</div>
													<Fileupload
														on:change={handleFileUpload_brochure}
														accept=".svg, .png, .jpg, .jpeg"
														class="dark:bg-white"
													/>
													{#if isFormSubmitted && !langData?.brochure?.trim()}
														<p class="error-message mt-2">Please upload brochure file</p>
													{/if}
												</Label>
											</div>

											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<div class="flex items-center justify-between mb-2">
														<span class="font-medium text-gray-700 dark:text-gray-300">Contract PDF</span>
													</div>
													<Fileupload
														on:change={handleFileUpload_pdf_contract}
														accept=".pdf"
														class="dark:bg-white"
													/>
												</Label>
											</div>
										</div>

										<!-- Video and Map Section -->
										<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">YouTube Video Link</span>
													<Input
														type="text"
														bind:value={langData.video_youtube_link}
														placeholder="Enter YouTube link"
														class="w-full"
													/>
													{#if isFormSubmitted && !langData.video_youtube_link.trim()}
														<p class="error-message mt-2">Please enter a YouTube link</p>
													{/if}
												</Label>
											</div>
											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Map Title</span>
													<Input
														type="text"
														bind:value={langData.map_title}
														placeholder="Enter map title"
														class="w-full"
													/>
													{#if isFormSubmitted && !langData.map_title.trim()}
														<p class="error-message mt-2">Please enter map title</p>
													{/if}
												</Label>
											</div>
										</div>

										<!-- Location Section -->
										<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Location Title</span>
													<Input
														type="text"
														bind:value={langData.location_title}
														placeholder="Enter location title"
														class="w-full"
													/>
													{#if isFormSubmitted && !langData.location_title.trim()}
														<p class="error-message mt-2">Please enter a location title</p>
													{/if}
												</Label>
											</div>
											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg md:col-span-2">
												<Label class="block">
													<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Location Address</span>
													<Input
														type="text"
														bind:value={langData.location}
														placeholder="Enter full address"
														class="w-full"
													/>
													{#if isFormSubmitted && !langData.location.trim()}
														<p class="error-message mt-2">Please enter a location</p>
													{/if}
												</Label>
											</div>
										</div>

										<!-- Title Section -->
										<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Exhibition Title</span>
												<Input
													type="text"
													placeholder="Enter title"
													bind:value={langData.title}
													id="title"
													name="title"
													class="w-full"
												/>
												{#if isFormSubmitted && !langData.title.trim()}
													<p class="error-message mt-2">Please enter a title</p>
												{/if}
											</Label>
										</div>
										
										<!-- Accordion Sections for Story and Description -->
										<div class="space-y-6 mb-10">
											<!-- Story Accordion -->
											<div class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
												<button class="w-full flex justify-between items-center p-5 text-left" 
													on:click={(e) => {
														e.preventDefault();
														langData.storyOpen = !langData.storyOpen;
													}}>
													<span class="font-medium text-gray-700 dark:text-gray-300">Story</span>
													<IconChevronDown size={20} class="transform transition-transform duration-200 {langData.storyOpen ? 'rotate-180' : ''}" />
												</button>
												{#if langData.storyOpen}
													<div class="p-6 pt-2 border-t border-gray-200 dark:border-gray-700">
														<Textarea
															placeholder="Enter a story"
															rows="4"
															bind:value={langData.story}
															id="story"
															name="story"
															class="w-full"
														/>
														{#if isFormSubmitted && !langData.story.trim()}
															<p class="error-message mt-2">Please enter a story</p>
														{/if}
													</div>
												{/if}
											</div>
											
											<!-- Description Accordion -->
											<div class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
												<button class="w-full flex justify-between items-center p-5 text-left" 
													on:click={(e) => {
														e.preventDefault();
														langData.descriptionOpen = !langData.descriptionOpen;
													}}>
													<span class="font-medium text-gray-700 dark:text-gray-300">Description</span>
													<IconChevronDown size={20} class="transform transition-transform duration-200 {langData.descriptionOpen ? 'rotate-180' : ''}" />
												</button>
												{#if langData.descriptionOpen}
													<div class="p-6 pt-2 border-t border-gray-200 dark:border-gray-700">
														<Textarea
															placeholder="Enter a description"
															rows="4"
															bind:value={langData.description}
															id="description"
															name="description"
															class="w-full"
														/>
														{#if isFormSubmitted && !langData.description.trim()}
															<p class="error-message mt-2">Please enter a description</p>
														{/if}
													</div>
												{/if}
											</div>
										</div>
									</div>
								</TabItem>
							{/each}
						</Tabs>
						<div class="border mb-2 dark:border-gray-800 mx-10" />
					</form>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
							<Label class="block">
								<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Sponsor Title</span>
								<Input
									type="text"
									bind:value={exhibitionsObject.sponsor_title}
									placeholder="Enter a title for sponsor"
									class="w-full"
								/>
								{#if isFormSubmitted && !exhibitionsObject.sponsor_title.trim()}
									<p class="error-message mt-2">Please enter a sponsor title</p>
								{/if}
							</Label>
						</div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
							<!-- Exhibition Images -->
							<div>
								<Label class="block mb-4">
									<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">Exhibition Images</span>
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
										<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
										{#if isFormSubmitted && sliderImagesFile.length === 0}
											<p class="error-message mt-2">
												Please upload at least one image for the exhibition
											</p>
										{/if}
									</div>
								</Label>
							</div>

							<!-- Sponsor Images -->
							<div>
								<Label class="block mb-4">
									<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">Sponsor Images</span>
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
										<FileUploadComponent on:imageFilesChanges={getAllImageFile_sponsor} />
										{#if isFormSubmitted && sliderImagesFile_sponsor.length === 0}
											<p class="error-message mt-2">
												Please upload at least one image for the sponsor
											</p>
										{/if}
									</div>
								</Label>
							</div>
						</div>

						<!-- Create Button -->
						<div class="flex justify-end my-8">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Create Exhibition
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
								{#each exhibitionsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.description}
											thumbnail={exhibitionsObject.thumbnail || placeholderImage}
											primaryColor="bg-primary"
											startDate={exhibitionsObject.start_date}
											endDate={exhibitionsObject.end_date}
										/>
									{/if}
								{/each}
							</div>
						</TabItem>

						<TabItem title="Map">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each exhibitionsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Flat}
											title={langData.map_title}
											short_description=""
											thumbnail={exhibitionsObject.image_map || placeholderImage}
											primaryColor="bg-primary"
											startDate={exhibitionsObject.start_date}
											endDate={exhibitionsObject.end_date}
										/>
									{/if}
								{/each}
							</div>
						</TabItem>

						<TabItem title="Brochure">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each exhibitionsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<div class="flex flex-col items-center">
											{#if langData.brochure}
												<ExpoCard
													cardType={CardType.Flat}
													title={langData.title ? `${langData.title} Brochure` : "Exhibition Brochure"}
													short_description=""
													thumbnail={langData.brochure}
													primaryColor="bg-primary"
													startDate={exhibitionsObject.start_date}
													endDate={exhibitionsObject.end_date}
												/>
											{:else}
												<div class="flex flex-col items-center justify-center text-center p-4">
													<img src={placeholderImage} alt="No brochure" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
													<p class="text-gray-500 dark:text-gray-400 mb-1">No brochure available</p>
													<p class="text-xs text-gray-400 dark:text-gray-500">Upload a brochure image for {langData.language} language</p>
												</div>
											{/if}
										</div>
									{/if}
								{/each}
							</div>
						</TabItem>

						<TabItem title="Gallery">
							<div class="p-4">
								{#each exhibitionsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										{#if carouselImages && carouselImages.length > 0}
											<DetailPage imagesCarousel={carouselImages} long_description="" />
										{:else}
											<div class="flex flex-col items-center justify-center text-center p-4">
												<img src={placeholderImage} alt="No gallery images" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
												<p class="text-gray-500 dark:text-gray-400 mb-1">No gallery images available</p>
												<p class="text-xs text-gray-400 dark:text-gray-500">Upload exhibition images to see them here</p>
											</div>
										{/if}
									{/if}
								{/each}
							</div>
						</TabItem>
						
						<TabItem title="Sponsors">
							<div class="p-4">
								{#each exhibitionsDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<div class="flex flex-col items-center">
											<h3 class="text-lg font-semibold mb-3">{exhibitionsObject.sponsor_title || "Sponsors"}</h3>
											{#if carouselImages_sponsor && carouselImages_sponsor.length > 0}
												<DetailPage imagesCarousel={carouselImages_sponsor} long_description="" />
											{:else}
												<div class="flex flex-col items-center justify-center text-center p-4">
													<img src={placeholderImage} alt="No sponsor images" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
													<p class="text-gray-500 dark:text-gray-400 mb-1">No sponsor images available</p>
													<p class="text-xs text-gray-400 dark:text-gray-500">Upload sponsor images to see them here</p>
												</div>
											{/if}
										</div>
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
