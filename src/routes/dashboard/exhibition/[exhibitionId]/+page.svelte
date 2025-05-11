<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/exhibitionStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { ExhibitionsModel } from '../../../../models/exhibitionModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { decodeBase64 } from '$lib/utils/decodeBase64';
	import { openPdfFile } from '$lib/utils/openPdfFile';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import type { ImagesModel } from '../../../../models/imagesModel';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import type { PDFModel } from '../../../../models/pdfModel';
	import { getImagesObject } from '$lib/utils/updateCarouselImages';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconEye, IconX, IconDeviceFloppy, IconChevronDown } from '@tabler/icons-svelte';

	// Define ExhibitionData type
	type ExhibitionData = {
		images: string[];
		[key: string]: any;
	};

	// Use an existing image as placeholder
	const placeholderImage = '/images/easel.png';

	let loaded = false;
	export let data;
	let sliderImagesFile: File[] = [];
	let sliderImagesFile_sponsor: File[] = [];
	let fileName: string;
	let fileName_map: string;
	let existingImages: string[] = [];
	let existingImages_sponsor: string[] = [];
	let imageFile: File | undefined;
	let imageFile_map: File | undefined;
	let imageFile_pdf: File | undefined;
	let imageFile_pdf_contract: File | undefined;
	let imageFile_brochure: File | undefined;

	type FileNameType = {
		lang: string;
		fileName: string;
		file: File;
	};
	let fileName_pdf: FileNameType[] = [];
	let fileName_pdf_contract: FileNameType[] = [];
	let fileName_brochure: FileNameType[] = [];

	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: string;
		imgSource?: ImgSourceEnum;
	};
	let carouselImages: CarouselImage[] | undefined = undefined;
	let carouselImages_sponsor: CarouselImage[] | undefined = undefined;
	let showToast = false;
	let prevThumbnail: string = '';
	let prevImage_map: string = '';
	let prevPDFFile: string = '';
	let prevPDFFile_contract: string = '';
	let prevBrochureFile: string = '';
	let isFormSubmitted = false;
	let pdfSource = ImgSourceEnum.PdfRemote;
	let pdfSource_contract = ImgSourceEnum.PdfRemote;
	let brochureSource_contract = ImgSourceEnum.remote;

	let exhibitionDataLang: ExhibitionsModelLang[] = [];
	let exhibitionsData: ExhibitionsModel = {
		id: 0,
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
		end_date: new Date()
	};
	const id = $page.params.exhibitionId;
	let images: ImagesModel[] = [];
	let sponsor_images: ImagesModel[] = [];
	let pdf_files: PDFModel[] = [];

	// Extended ExhibitionsModelLang interface with accordion state properties
	interface ExhibitionsModelLang {
		story: string;
		title: string;
		description: string;
		video_youtube_link: string;
		location: string;
		location_title: string;
		map_title: string;
		pdf_files: string;
		contract_file: string;
		brochure: string;
		language: LanguageEnum;
		storyOpen?: boolean;
		descriptionOpen?: boolean;
	}

	//**** get data from db and put it into the fields ****//
	async function getExhibitionData() {
		loaded = false;
		await data.supabase
			.from('exhibition')
			.select('*,exhibition_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				exhibitionsData = {
					id: result.data?.id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					exhibition_type: result.data?.exhibition_type,
					image_map: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.image_map
					}`,
					deleted_status: result.data?.deleted_status,
					company_number: result.data?.company_number,
					country_number: result.data?.country_number,
					start_date: new Date(result.data?.start_date),
					end_date: new Date(result.data?.end_date),
					sponsor_images: result.data?.sponsor_images,
					sponsor_title: result.data?.sponsor_title
				};

				prevThumbnail = result.data?.thumbnail;
				prevImage_map = result.data?.image_map;

				images = getImage();
				sponsor_images = getImage_sponsor();
				// pdf_files = getPdfFile();
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.exhibition_languages.findIndex(
						(exhibitionLang: ExhibitionsModelLang) =>
							exhibitionLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const exhibitionLang = result.data?.exhibition_languages[index];
					exhibitionDataLang.push({
						story: exhibitionLang?.story ?? '',
						title: exhibitionLang?.title ?? '',
						description: exhibitionLang?.description ?? '',
						video_youtube_link: exhibitionLang?.video_youtube_link ?? '',
						location: exhibitionLang?.location ?? '',
						location_title: exhibitionLang?.location_title ?? '',
						map_title: exhibitionLang?.map_title ?? '',
						pdf_files: exhibitionLang?.pdf_files ?? '',
						contract_file: exhibitionLang?.contract_file ?? '',
						brochure: exhibitionLang?.brochure ?? '',
						language:
							exhibitionLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum],
						storyOpen: false,
						descriptionOpen: false
					});
					prevPDFFile = exhibitionLang?.pdf_files;
					prevBrochureFile = exhibitionLang?.brochure;
					prevPDFFile_contract = exhibitionLang?.contract_file;
				}
				exhibitionDataLang = [...exhibitionDataLang];
				exhibitionsData = { ...exhibitionsData };
				
				// Convert to proper type for getImagesObject
				const exhibitionDataForImages: ExhibitionData = {
					...exhibitionsData,
					images: Array.isArray(exhibitionsData.images) ? exhibitionsData.images : []
				};
				carouselImages = getImagesObject(exhibitionDataForImages);
				carouselImages_sponsor = getImagesObject_sponsor();
			});
			loaded = true;
	}

	onMount(async () => {
		await getExhibitionData();
		// Ensure all language types are proper enums
		exhibitionDataLang.forEach(lang => {
			lang.language = getLanguageEnum(lang.language);
		});
		carouselImages_sponsor = getImagesObject_sponsor();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	function handleFileUploadThumbnail(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;

		const reader = new FileReader();

		reader.onloadend = () => {
			exhibitionsData.thumbnail = reader.result as '';
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
			exhibitionsData.image_map = reader.result as '';
			const randomText = getRandomTextNumber();
			fileName_map = `exhibition/${randomText}`;
		};

		reader.readAsDataURL(file);
	}

	// handle pdf
	function handleFileUpload_pdf(e: Event) {
		pdfSource = ImgSourceEnum.PdfLocal;

		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile_pdf = file;

		const reader = new FileReader();

		reader.onloadend = () => {
			for (let lang of exhibitionDataLang) {
				if (lang.language === selectedLanguageTab) {
					lang.pdf_files = reader.result as '';
				}
			}

			const randomText = getRandomTextNumber();
			
			// Check if we already have an entry for this language
			const existingIndex = fileName_pdf.findIndex(item => item.lang === selectedLanguageTab);
			if (existingIndex >= 0) {
				// Update existing entry
				fileName_pdf[existingIndex] = {
					lang: selectedLanguageTab,
					fileName: `${randomText}`,
					file: file
				};
			} else {
				// Add new entry
				fileName_pdf.push({
					lang: selectedLanguageTab,
					fileName: `${randomText}`,
					file: file
				});
			}
		};

		reader.readAsDataURL(file);
	}

	// handle pdf contract
	function handleFileUpload_pdf_contract(e: Event) {
		pdfSource_contract = ImgSourceEnum.PdfLocal;

		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile_pdf_contract = file;

		const reader = new FileReader();

		reader.onloadend = () => {
			for (let lang of exhibitionDataLang) {
				if (lang.language === selectedLanguageTab) {
					lang.contract_file = reader.result as '';
				}
			}

			const randomText = getRandomTextNumber();
			
			// Check if we already have an entry for this language
			const existingIndex = fileName_pdf_contract.findIndex(item => item.lang === selectedLanguageTab);
			if (existingIndex >= 0) {
				// Update existing entry
				fileName_pdf_contract[existingIndex] = {
					lang: selectedLanguageTab,
					fileName: `${randomText}`,
					file: file
				};
			} else {
				// Add new entry
				fileName_pdf_contract.push({
					lang: selectedLanguageTab,
					fileName: `${randomText}`,
					file: file
				});
			}
		};

		reader.readAsDataURL(file);
	}

	// handle brochure

	let brochureSourceMap: Record<string, ImgSourceEnum> = {};

	$: {
		languageEnumKeys.forEach((key) => {
			brochureSourceMap[LanguageEnum[key as keyof typeof LanguageEnum]] = ImgSourceEnum.remote;
		});
	}

	function handleFileUpload_brochure(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile_brochure = file;
		const lang = selectedLanguageTab;

		const reader = new FileReader();

		reader.onloadend = () => {
			// Find the exhibition data for the current language
			const langIndex = exhibitionDataLang.findIndex(
				(lang) => lang.language === selectedLanguageTab
			);
			
			if (langIndex >= 0) {
				// Update the brochure for this specific language
				exhibitionDataLang[langIndex].brochure = reader.result as string;
				brochureSourceMap[selectedLanguageTab] = ImgSourceEnum.local;
			}

			const randomText = getRandomTextNumber();
			
			// Check if we already have an entry for this language
			const existingIndex = fileName_brochure.findIndex(item => item.lang === selectedLanguageTab);
			if (existingIndex >= 0) {
				// Update existing entry
				fileName_brochure[existingIndex] = {
					lang: selectedLanguageTab,
					fileName: `brochure_${selectedLanguageTab}_${randomText}`,
					file: file
				};
			} else {
				// Add new entry
				fileName_brochure.push({
					lang: selectedLanguageTab,
					fileName: `brochure_${selectedLanguageTab}_${randomText}`,
					file: file
				});
			}

			// Trigger reactivity
			exhibitionDataLang = [...exhibitionDataLang];
		};

		reader.readAsDataURL(file);
	}

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
	} //**dropzone**//

	//**dropzone-sponsor**//
	function getAllImageFile_sponsor(e: { detail: File[] }) {
		sliderImagesFile_sponsor = e.detail;
	} //**dropzone-sponsor**//
	//get image
	function getImage() {
		if (!exhibitionsData.images || !Array.isArray(exhibitionsData.images)) {
			return [];
		}
		
		let result = exhibitionsData.images.map((image: string, i: number) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		return result;
	}
	function getImage_sponsor() {
		if (!exhibitionsData.sponsor_images || !Array.isArray(exhibitionsData.sponsor_images)) {
			return [];
		}
		
		let result = exhibitionsData.sponsor_images.map((image: string, i: number) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		return result;
	}

	function getImagesObject_sponsor() {
		if (!exhibitionsData.sponsor_images || !Array.isArray(exhibitionsData.sponsor_images)) {
			return undefined;
		}
		
		const carouselImages_sponsor: CarouselImage[] = exhibitionsData.sponsor_images.map((image, i) => {
			return {
				id: i,
				imgurl: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`,
				imgSource: ImgSourceEnum.remote,
				name: image,
				attribution: ''
			};
		});

		// Update the global variable for use in the preview
		if (carouselImages_sponsor.length > 0) {
			return carouselImages_sponsor;
		}
		return undefined;
	}

	// Convert string language to enum if needed
	function getLanguageEnum(lang: string): LanguageEnum {
		if (Object.values(LanguageEnum).includes(lang as LanguageEnum)) {
			return lang as LanguageEnum;
		}
		return LanguageEnum.EN; // Default fallback
	}

	//**Handle submit**//

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidExhibitionObject = false;

		// Check if at least one language has all required fields
		for (let lang of exhibitionDataLang) {
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
			const isLocationEmpty = isEmpty(location);
			const isLocation_titleEmpty = isEmpty(location_title);
			const isMapTitleEmpty = isEmpty(mapTitle);

			// Check if this specific language has a PDF and brochure
			const hasPdfFiles = !isEmpty(lang.pdf_files);
			const hasBrochure = !isEmpty(lang.brochure);

			// Consider a language complete if all its fields are filled
			if (
				hasPdfFiles &&
				hasBrochure &&
				!isStoryIsEmpty &&
				!isTitleEmpty &&
				!isShortDescriptionEmpty &&
				!isLinkEmpty &&
				!isLocationEmpty &&
				!isMapTitleEmpty &&
				!isLocation_titleEmpty
			) {
				hasDataForLanguage = true;
				break; // If at least one language is complete, we can proceed
			}
		}

		// Check if the general exhibition data is valid
		if (
			!isEmpty(exhibitionsData.thumbnail) &&
			exhibitionsData.country_number > 0 &&
			exhibitionsData.company_number > 0 &&
			!isEmpty(exhibitionsData.exhibition_type) &&
			!isEmpty(exhibitionsData.sponsor_title)
		) {
			isValidExhibitionObject = true;
		}

		if (hasDataForLanguage && isValidExhibitionObject) {
			showToast = true;

			// Store initial values for restoration if needed
			const initialImages = [...exhibitionsData.images];
			const initialSponsorImages = [...exhibitionsData.sponsor_images];

			// Don't clear the arrays, just initialize them for new values
			exhibitionsData.images = [];
			exhibitionsData.sponsor_images = [];

			if (imageFile) {
				if (exhibitionsData.thumbnail) {
					await data.supabase.storage.from('image').remove([exhibitionsData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				exhibitionsData.thumbnail = response.data?.path || '';
			} else {
				exhibitionsData.thumbnail = prevThumbnail;
			}

			if (imageFile_map) {
				if (exhibitionsData.image_map) {
					await data.supabase.storage.from('image').remove([exhibitionsData.image_map]);
				}
				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName_map}`, imageFile_map!);
				exhibitionsData.image_map = response.data?.path || '';
			} else {
				exhibitionsData.image_map = prevImage_map;
			}

			// Process PDFs for each language separately
			for (let lang of exhibitionDataLang) {
				const langCode = lang.language;
				
				// Handle PDF files for this specific language
				const pdfFileData = fileName_pdf.find((fileData) => fileData.lang === langCode);
				if (pdfFileData) {
					// If we have a new PDF for this language, upload it
					if (lang.pdf_files && !lang.pdf_files.startsWith('data:')) {
						await data.supabase.storage.from('PDF').remove([lang.pdf_files]);
					}
					const response = await data.supabase.storage
						.from('PDF')
						.upload(`pdfFiles/${pdfFileData.fileName}`, pdfFileData.file!);
					lang.pdf_files = response.data?.path || '';
				}
				
				// Handle contract PDF files for this specific language
				const contractFileData = fileName_pdf_contract.find((fileData) => fileData.lang === langCode);
				if (contractFileData) {
					// If we have a new contract PDF for this language, upload it
					if (lang.contract_file && !lang.contract_file.startsWith('data:')) {
						await data.supabase.storage.from('PDF').remove([lang.contract_file]);
					}
					const response = await data.supabase.storage
						.from('PDF')
						.upload(`pdfFiles/${contractFileData.fileName}`, contractFileData.file!);
					lang.contract_file = response.data?.path || '';
				}
				
				// Handle brochure files for this specific language
				const brochureFileData = fileName_brochure.find((fileData) => fileData.lang === langCode);
				if (brochureFileData) {
					// If we have a new brochure for this language, upload it
					if (lang.brochure && !lang.brochure.startsWith('data:')) {
						await data.supabase.storage.from('image').remove([lang.brochure]);
					}
					const response = await data.supabase.storage
						.from('image')
						.upload(`exhibition/${brochureFileData.fileName}`, brochureFileData.file!);
					lang.brochure = response.data?.path || '';
				}
			}

			// ***insert  images *****//
			if (sliderImagesFile.length > 0) {
				for (let image of sliderImagesFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`exhibition/${randomText}`, image!);
					//

					if (responseMultiple.data?.path) {
						exhibitionsData.images.push(responseMultiple.data?.path);
					}
				}
			}

			// Add existing images from the UI
			for (let image of existingImages) {
				exhibitionsData.images.push(image);
			}
			
			// If no new images were added and no existing images in UI, keep the original images
			if (exhibitionsData.images.length === 0 && initialImages.length > 0) {
				exhibitionsData.images = initialImages;
			}
			
			// Convert exhibition.images to a valid array string format
			const imagesArray = exhibitionsData.images.map((image) => `"${image}"`);
			exhibitionsData.images = `{${imagesArray.join(',')}}`;

			// ***insert sponsor images *****//
			if (sliderImagesFile_sponsor.length > 0) {
				for (let image of sliderImagesFile_sponsor) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`exhibition/${randomText}`, image!);
					//

					if (responseMultiple.data?.path) {
						exhibitionsData.sponsor_images.push(responseMultiple.data?.path);
					}
				}
			}

			// Add existing sponsor images from the UI
			for (let image of existingImages_sponsor) {
				exhibitionsData.sponsor_images.push(image);
			}
			
			// If no new sponsor images were added and no existing sponsor images in UI, keep the original sponsor images
			if (exhibitionsData.sponsor_images.length === 0 && initialSponsorImages.length > 0) {
				exhibitionsData.sponsor_images = initialSponsorImages;
			}
			
			// Convert exhibition.sponsor_images to a valid array string format
			const imagesArray_sponsor = exhibitionsData.sponsor_images.map((image) => `"${image}"`);
			exhibitionsData.sponsor_images = `{${imagesArray_sponsor.join(',')}}`;

			// ***insert pdf *****//

			// Ensure all exhibition language data has the correct language enum type
			const exhibitionDataLangForUpdate = exhibitionDataLang.map(lang => ({
				...lang,
				language: getLanguageEnum(lang.language)
			}));

			updateData(exhibitionsData, exhibitionDataLangForUpdate, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/exhibition');
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

	//update images_sponsor
	function imageChanges_sponsor(e: any) {
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
		carouselImages_sponsor = customImages;
		existingImages_sponsor = result;
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
			<span class="font-medium">Update Successful!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update Exhibition</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Edit exhibition details and manage media files</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Image</span>
						<div class="relative">
							{#if exhibitionsData.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											exhibitionsData.thumbnail = '';
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
						{#if isFormSubmitted && !exhibitionsData.thumbnail.trim()}
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
							{#if exhibitionsData.image_map}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											exhibitionsData.image_map = '';
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
								<Input bind:value={exhibitionsData.exhibition_type} placeholder="Enter Exhibition Type" class="w-full" />
								{#if isFormSubmitted && !exhibitionsData.exhibition_type.trim()}
									<p class="error-message mt-2">Please enter an exhibition type</p>
								{/if}
							</Label>
						</div>
						<div class="md:col-span-1">
							<Label class="block mb-2">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Start Date</span>
								<Input type="date" bind:value={exhibitionsData.start_date} class="w-full" />
							</Label>
						</div>
						<div class="md:col-span-1">
							<Label class="block mb-2">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">End Date</span>
								<Input type="date" bind:value={exhibitionsData.end_date} class="w-full" />
							</Label>
						</div>
						<div class="md:col-span-1">
							<Label class="block mb-2">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Country / Company</span>
								<div class="grid grid-cols-2 gap-2">
									<Input
										type="number"
										bind:value={exhibitionsData.country_number}
										placeholder="Country #"
										min="0"
										class="w-full"
									/>
									<Input
										type="number"
										bind:value={exhibitionsData.company_number}
										placeholder="Company #"
										min="0"
										class="w-full"
									/>
								</div>
								{#if isFormSubmitted && (!exhibitionsData.country_number || !exhibitionsData.company_number)}
									<p class="error-message mt-2">Both fields required</p>
								{/if}
							</Label>
						</div>
					</div>
				</div>
			</div>
		</div>

	 
		<!-- comment  -->
		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
							{#each exhibitionDataLang as langData}
								<TabItem
									open={langData.language == selectedLanguageTab}
									title={langData.language}
									on:click={() => {
										selectedLanguageTab = getLanguageEnum(langData.language);
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
																	on:click={() =>
																		pdfSource == ImgSourceEnum.PdfLocal
																			? decodeBase64(langData?.pdf_files ?? '')
																			: openPdfFile(langData?.pdf_files ?? '')}
																	class="cursor-pointer text-xs inline-flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary-dark rounded-full text-white transition-colors duration-200"
																	>
																	<IconEye size={16} />
																	View PDF
																</button>
																<button
																	type="button"
																	class="cursor-pointer inline-flex items-center justify-center p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors duration-200"
																	on:click={(e) => {
																		e.preventDefault();
																		e.stopPropagation();
																		langData.pdf_files = '';
																		fileName_pdf = fileName_pdf.filter(item => item.lang !== selectedLanguageTab);
																		imageFile_pdf = undefined;
																	}}
																	>
																	<IconX size={16} />
																</button>
															</div>
														{/if}
													</div>
													<Fileupload
														on:change={handleFileUpload_pdf}
														accept=".pdf"
														class="dark:bg-white"
													/>
													{#if isFormSubmitted && isEmpty(langData.pdf_files) && !exhibitionDataLang.some(l => !isEmpty(l.pdf_files))}
														<p class="error-message mt-2">Please upload PDF file</p>
													{/if}
												</Label>
											</div>

											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<div class="flex items-center justify-between mb-2">
														<span class="font-medium text-gray-700 dark:text-gray-300">Brochure</span>
														{#if langData.brochure}
															<button
																type="button"
																class="cursor-pointer inline-flex items-center justify-center p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors duration-200"
																on:click={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	langData.brochure = '';
																	fileName_brochure = fileName_brochure.filter(item => item.lang !== selectedLanguageTab);
																	imageFile_brochure = undefined;
																	brochureSourceMap[selectedLanguageTab] = ImgSourceEnum.remote;
																	exhibitionDataLang = [...exhibitionDataLang];
																}}
																>
																<IconX size={16} />
															</button>
														{/if}
													</div>
													<Fileupload
														on:change={handleFileUpload_brochure}
														accept=".svg, .png, .jpg, .jpeg"
														class="dark:bg-white"
													/>
													{#if isFormSubmitted && isEmpty(langData.brochure) && !exhibitionDataLang.some(l => !isEmpty(l.brochure))}
														<p class="error-message mt-2">Please upload brochure file</p>
													{/if}
												</Label>
											</div>

											<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
												<Label class="block">
													<div class="flex items-center justify-between mb-2">
														<span class="font-medium text-gray-700 dark:text-gray-300">Contract PDF</span>
														{#if langData.contract_file}
															<div class="flex space-x-2">
																<button
																	on:click={() =>
																		pdfSource_contract == ImgSourceEnum.PdfLocal
																			? decodeBase64(langData?.contract_file ?? '')
																			: openPdfFile(langData?.contract_file ?? '')}
																	class="cursor-pointer text-xs inline-flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary-dark rounded-full text-white transition-colors duration-200"
																	>
																	<IconEye size={16} />
																	View PDF
																</button>
																<button
																	type="button"
																	class="cursor-pointer inline-flex items-center justify-center p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors duration-200"
																	on:click={(e) => {
																		e.preventDefault();
																		e.stopPropagation();
																		langData.contract_file = '';
																		fileName_pdf_contract = fileName_pdf_contract.filter(item => item.lang !== selectedLanguageTab);
																		imageFile_pdf_contract = undefined;
																	}}
																	>
																	<IconX size={16} />
																</button>
															</div>
														{/if}
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
					</form>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
							<Label class="block">
								<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Sponsor Title</span>
								<Input
									type="text"
									bind:value={exhibitionsData.sponsor_title}
									placeholder="Enter a title for sponsor"
									class="w-full"
								/>
								{#if isFormSubmitted && !exhibitionsData.sponsor_title.trim()}
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
										<FileUploadComponent
											on:imageChanges={imageChanges}
											on:imageFilesChanges={getAllImageFile}
											data={{ images: images }}
										/>
									</div>
								</Label>
							</div>

							<!-- Sponsor Images -->
							<div>
								<Label class="block mb-4">
									<span class="font-medium text-gray-700 dark:text-gray-300 block mb-3">Sponsor Images</span>
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
										<FileUploadComponent
											on:imageChanges={imageChanges_sponsor}
											on:imageFilesChanges={getAllImageFile_sponsor}
											data={{ images: sponsor_images }}
										/>
									</div>
								</Label>
							</div>
						</div>

						<!-- Update Button -->
						<div class="flex justify-end my-8">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Update Exhibition
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
								{#each exhibitionDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.description}
											thumbnail={exhibitionsData.thumbnail}
											primaryColor="bg-primary"
											startDate={exhibitionsData.start_date}
											endDate={exhibitionsData.end_date}
										/>
									{/if}
								{/each}
							</div>
						</TabItem>

						<TabItem title="Map">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each exhibitionDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Flat}
											title={langData.map_title}
											short_description=""
											thumbnail={exhibitionsData.image_map}
											primaryColor="bg-primary"
											startDate={exhibitionsData.start_date}
											endDate={exhibitionsData.end_date}
										/>
									{/if}
								{/each}
							</div>
						</TabItem>

						<TabItem title="Brochure">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each exhibitionDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<div class="flex flex-col items-center">
											{#if langData.brochure}
												<ExpoCard
													cardType={CardType.Flat}
													title={langData.title ? `${langData.title} Brochure` : "Exhibition Brochure"}
													short_description=""
													thumbnail={brochureSourceMap[selectedLanguageTab] === ImgSourceEnum.local
														? langData.brochure
														: (langData.brochure ? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${langData.brochure}` : exhibitionsData.thumbnail)}
													primaryColor="bg-primary"
													startDate={exhibitionsData.start_date}
													endDate={exhibitionsData.end_date}
												/>
											{:else}
												<div class="flex flex-col items-center justify-center text-center p-4">
													<img src={placeholderImage} alt="No brochure" class="w-48 h-auto rounded-lg opacity-50 mb-3" />
													<p class="text-gray-500 dark:text-gray-400 mb-1">No brochure available for {langData.language}</p>
													<p class="text-xs text-gray-400 dark:text-gray-500">Upload a brochure image for this language</p>
												</div>
											{/if}
										</div>
									{/if}
								{/each}
							</div>
						</TabItem>

						<TabItem title="Gallery">
							<div class="p-4">
								{#each exhibitionDataLang as langData}
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
								{#each exhibitionDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<div class="flex flex-col items-center">
											<h3 class="text-lg font-semibold mb-3">{exhibitionsData.sponsor_title || "Sponsors"}</h3>
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
