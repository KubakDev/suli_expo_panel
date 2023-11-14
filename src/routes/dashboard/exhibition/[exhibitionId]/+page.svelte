<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/exhibitionStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { ExhibitionsModel, ExhibitionsModelLang } from '../../../../models/exhibitionModel';
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
		name: File;
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

	//**** get data from db and put it into the fields ****//
	async function getExhibitionData() {
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
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
					prevPDFFile = exhibitionLang?.pdf_files;
					prevBrochureFile = exhibitionLang?.brochure;
					prevPDFFile_contract = exhibitionLang?.contract_file;
				}
				exhibitionDataLang = [...exhibitionDataLang];
				exhibitionsData = { ...exhibitionsData };
				carouselImages = getImagesObject(exhibitionsData);
				getImagesObject_sponsor();
			});
	}

	onMount(async () => {
		await getExhibitionData();
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
		const lang = selectedLanguageTab;

		const reader = new FileReader();

		reader.onloadend = () => {
			for (let lang of exhibitionDataLang) {
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

	// handle pdf contract
	function handleFileUpload_pdf_contract(e: Event) {
		pdfSource_contract = ImgSourceEnum.PdfLocal;

		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile_pdf_contract = file;
		const lang = selectedLanguageTab; // Get the selected language

		const reader = new FileReader();

		reader.onloadend = () => {
			for (let lang of exhibitionDataLang) {
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
			const updatedBrochure = exhibitionDataLang.find(
				(lang) => lang.language === selectedLanguageTab
			);
			if (updatedBrochure) {
				updatedBrochure.brochure = reader.result as string;
				brochureSourceMap[selectedLanguageTab] = ImgSourceEnum.local;
			}

			const randomText = getRandomTextNumber();
			fileName_brochure.push({
				lang: selectedLanguageTab,
				fileName: `brochure_${selectedLanguageTab}_${randomText}`,
				file: file
			});

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
		let result = exhibitionsData.images.map((image, i) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		//
		return result;
	}
	function getImage_sponsor() {
		let result = exhibitionsData.sponsor_images.map((image, i) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		//
		return result;
	}

	function getImagesObject_sponsor() {
		const carouselImages_sponsor = exhibitionsData.sponsor_images.map((image, i) => {
			return {
				id: i,
				imgurl: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`,
				imgSource: ImgSourceEnum.remote,
				name: image,
				attribution: ''
			};
		});

		return carouselImages_sponsor.length > 0 ? carouselImages_sponsor : undefined;
	}

	//**Handle submit**//

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidExhibitionObject = false;

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

			if (
				!isEmpty(lang.pdf_files) ||
				!isEmpty(lang.brochure) ||
				!isStoryIsEmpty ||
				!isTitleEmpty ||
				!isShortDescriptionEmpty ||
				!isLinkEmpty ||
				!isLocationEmpty ||
				!isMapTitleEmpty ||
				!isLocation_titleEmpty
			) {
				// At least one field is not empty
				hasDataForLanguage = true;
				if (
					isEmpty(lang.pdf_files) ||
					isEmpty(lang.brochure) ||
					isStoryIsEmpty ||
					isTitleEmpty ||
					isShortDescriptionEmpty ||
					isLinkEmpty ||
					isLocationEmpty ||
					isMapTitleEmpty ||
					isLocation_titleEmpty
				) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (
			!isEmpty(exhibitionsData.thumbnail) &&
			// exhibitionsData.images.length > 0 &&
			// exhibitionsData.sponsor_images.length > 0 &&
			exhibitionsData.country_number > 0 &&
			exhibitionsData.company_number > 0 &&
			!isEmpty(exhibitionsData.exhibition_type) &&
			!isEmpty(exhibitionsData.sponsor_title)
		) {
			isValidExhibitionObject = true;
		}

		if (hasDataForLanguage && isValidExhibitionObject) {
			showToast = true;

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

			if (imageFile_pdf) {
				for (let lang of exhibitionDataLang) {
					const pdfFileData = fileName_pdf.find((fileData) => fileData.lang === lang.language);
					if (pdfFileData) {
						if (lang.pdf_files) {
							await data.supabase.storage.from('PDF').remove([lang.pdf_files]);
						}
						const response = await data.supabase.storage
							.from('PDF')
							.upload(`pdfFiles/${pdfFileData.fileName}`, pdfFileData.file!);
						lang.pdf_files = response.data?.path || '';
					}
				}
			} else {
				for (let lang of exhibitionDataLang) {
					lang.pdf_files = prevPDFFile;
				}
			}

			if (imageFile_pdf_contract) {
				for (let lang of exhibitionDataLang) {
					const pdfFileData = fileName_pdf_contract.find(
						(fileData) => fileData.lang === lang.language
					);
					if (pdfFileData) {
						if (lang.contract_file) {
							await data.supabase.storage.from('PDF').remove([lang.contract_file]);
						}
						const response = await data.supabase.storage
							.from('PDF')
							.upload(`pdfFiles/${pdfFileData.fileName}`, pdfFileData.file!);
						lang.contract_file = response.data?.path || '';
					}
				}
			} else {
				for (let lang of exhibitionDataLang) {
					lang.contract_file = prevPDFFile_contract;
				}
			}

			if (imageFile_brochure) {
				for (let lang of exhibitionDataLang) {
					const brochureFileData = fileName_brochure.find(
						(fileData) => fileData.lang === lang.language
					);
					if (brochureFileData) {
						if (lang.brochure) {
							await data.supabase.storage.from('image').remove([lang.pdf_files]);
						}
						const response = await data.supabase.storage
							.from('image')
							.upload(`exhibition/${brochureFileData.fileName}`, brochureFileData.file!);
						lang.brochure = response.data?.path || '';
					}
				}
			} else {
				for (let lang of exhibitionDataLang) {
					lang.brochure = prevBrochureFile;
				}
			}

			// ***insert  images *****//

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

			for (let image of existingImages) {
				exhibitionsData.images.push(image);
			}
			// Convert exhibition.images to a valid array string format
			const imagesArray = exhibitionsData.images.map((image) => `"${image}"`);
			exhibitionsData.images = `{${imagesArray.join(',')}}`;

			// ***insert sponsor images *****//

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

			for (let image of existingImages_sponsor) {
				exhibitionsData.sponsor_images.push(image);
			}
			// Convert exhibition.images to a valid array string format
			const imagesArray_sponsor = exhibitionsData.sponsor_images.map((image) => `"${image}"`);
			exhibitionsData.sponsor_images = `{${imagesArray_sponsor.join(',')}}`;

			// ***insert pdf *****//

			updateData(exhibitionsData, exhibitionDataLang, data.supabase);

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

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			The Update Was Successfully!
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10">
			<h1 class="text-2xl font-bold">Update Exhibition Data</h1>
		</div>

		<div class="grid lg:grid-cols-12 gap-4 px-4 py-2">
			<div class="col-span-4">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Exhibition Image</Label>
					<Fileupload
						on:change={handleFileUploadThumbnail}
						accept=".jpg, .jpeg, .png"
						class="dark:bg-white"
					/>
					{#if isFormSubmitted && !exhibitionsData.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-4">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail_map" class="mb-2">Upload Image Map</Label>
					<Fileupload
						on:change={handleFileUploadMap}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
						lang={selectedLanguageTab}
					/>
				</Label>
			</div>

			<div class="col-span-2">
				<Label class="space-y-2 mb-2">
					<span>Start Date</span>
					<Input type="date" bind:value={exhibitionsData.start_date} />
				</Label>
			</div>
			<div class="col-span-2">
				<Label class="space-y-2 mb-2">
					<span>End Date</span>
					<Input type="date" bind:value={exhibitionsData.end_date} />
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-12 gap-4 px-4 py-2">
			<div class="col-span-4">
				<Label for="default-input" class="block mb-2">Exhibition Type</Label>
				<Input bind:value={exhibitionsData.exhibition_type} placeholder="Enter Exhibition Type" />
				{#if isFormSubmitted && !exhibitionsData.exhibition_type.trim()}
					<p class="error-message">Please enter an exhibition type</p>
				{/if}
			</div>

			<div class="col-span-2">
				<Label class="space-y-2 mb-2">
					<span>Country No</span>
					<Input
						type="number"
						bind:value={exhibitionsData.country_number}
						placeholder="Enter a number"
						min="0"
					/>
					{#if isFormSubmitted && !exhibitionsData.country_number}
						<p class="error-message">Required</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-2">
				<Label class="space-y-2 mb-2">
					<span>Company No</span>
					<Input
						type="number"
						bind:value={exhibitionsData.company_number}
						placeholder="Enter a number"
						min="0"
					/>
					{#if isFormSubmitted && !exhibitionsData.company_number}
						<p class="error-message">Required</p>
					{/if}
				</Label>
			</div>
		</div>
		<!-- comment  -->
		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form>
					<Tabs contentClass="dark:bg-gray-900">
						{#each exhibitionDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-10 py-10">
									<div class="text-center w-full pb-10">
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

									<div class="pb-10 flex gap-3 col-span-1">
										<Label class="w-2/4 space-y-2 mb-2">
											<span>Upload pdf file </span>
											<Fileupload
												on:change={handleFileUpload_pdf}
												accept=".pdf"
												class=" dark:bg-white"
											/>
											{#if isFormSubmitted && !langData.pdf_files.trim()}
												<p class="error-message">Please Upload PDF file</p>
											{/if}

											<div>
												<button
													on:click={() =>
														pdfSource == ImgSourceEnum.PdfLocal
															? decodeBase64(langData?.pdf_files ?? '')
															: openPdfFile(langData?.pdf_files ?? '')}
													class="cursor-pointer text-xs hover:text-red-700 text-gray-600"
													>Click here to view the PDF</button
												>

												<button
													on:click={() =>
														pdfSource == ImgSourceEnum.PdfLocal
															? decodeBase64(langData?.pdf_files ?? '')
															: openPdfFile(langData?.pdf_files ?? '')}
													class="cursor-pointer"
												/>
											</div>
										</Label>

										<Label class="w-2/4 space-y-2 mb-2">
											<span>Upload brochure file </span>
											<Fileupload
												on:change={handleFileUpload_brochure}
												accept=".svg, .png, .jpg, .jpeg"
												class=" dark:bg-white"
											/>
											{#if isFormSubmitted && !langData.brochure.trim()}
												<p class="error-message">Please Upload brochure file</p>
											{/if}
										</Label>

										<Label class="w-2/4 space-y-2 mb-2">
											<span>Upload pdf contract </span>
											<Fileupload
												on:change={handleFileUpload_pdf_contract}
												accept=".pdf"
												class=" dark:bg-white"
											/>

											<div>
												<button
													on:click={() =>
														pdfSource_contract == ImgSourceEnum.PdfLocal
															? decodeBase64(langData?.contract_file ?? '')
															: openPdfFile(langData?.contract_file ?? '')}
													class="cursor-pointer text-xs hover:text-red-700 text-gray-600"
													>Click here to view the PDF</button
												>

												<button
													on:click={() =>
														pdfSource_contract == ImgSourceEnum.PdfLocal
															? decodeBase64(langData?.contract_file ?? '')
															: openPdfFile(langData?.contract_file ?? '')}
													class="cursor-pointer"
												/>
											</div>
										</Label>
									</div>

									<div class="pb-10 flex gap-3 col-span-1">
										<Label class="w-2/4 space-y-2 mb-2">
											<span>Link for youtube video</span>
											<Input
												type="text"
												bind:value={langData.video_youtube_link}
												placeholder="Enter a link"
											/>

											{#if isFormSubmitted && !langData.video_youtube_link.trim()}
												<p class="error-message">Please enter a link for youtube video</p>
											{/if}
										</Label>
										<Label class="w-2/4 space-y-2 mb-2">
											<span>Map Title</span>
											<Input
												type="text"
												bind:value={langData.map_title}
												placeholder="Enter title"
											/>

											{#if isFormSubmitted && !langData.map_title.trim()}
												<p class="error-message">Please enter map title</p>
											{/if}
										</Label>
									</div>

									<div class="pb-10 flex gap-3 col-span-1">
										<Label class="w-1/3 space-y-2 mb-2">
											<span>Title for location</span>
											<Input
												type="text"
												bind:value={langData.location_title}
												placeholder="Enter a link"
											/>
											{#if isFormSubmitted && !langData.location_title.trim()}
												<p class="error-message">Please enter a location title</p>
											{/if}
										</Label>
										<Label class="w-2/3 space-y-2 mb-2">
											<span>Location</span>
											<Input
												type="text"
												bind:value={langData.location}
												placeholder="Enter a link"
											/>
											{#if isFormSubmitted && !langData.location.trim()}
												<p class="error-message">Please enter a location</p>
											{/if}
										</Label>
									</div>

									<div class="py-10">
										<Label for="first_name" class="mb-2">Exhibition Title</Label>

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
										<Label for="textarea-id" class="mb-2">story</Label>
										<Textarea
											placeholder="Enter a story"
											rows="4"
											bind:value={langData.story}
											id="story"
											name="story"
										/>
										{#if isFormSubmitted && !langData.story.trim()}
											<p class="error-message">Please enter a story</p>
										{/if}
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">Description</Label>
										<Textarea
											placeholder="Enter a description"
											rows="4"
											bind:value={langData.description}
											id="description"
											name="description"
										/>
										{#if isFormSubmitted && !langData.description.trim()}
											<p class="error-message">Please enter a description</p>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
					<div class="border mb-2 dark:border-gray-800 mx-10" />
				</form>

				<div class="px-8 pt-5">
					<Label for="textarea-id" class="mb-2">Sponsor title</Label>
					<Input
						type="text"
						bind:value={exhibitionsData.sponsor_title}
						placeholder="Enter a title for sponsor"
					/>
				</div>
				<div class="grid lg:grid-cols-2 pt-5">
					<!-- upload Exhibition image -->
					<Label class="space-y-2 mb-2">
						<Label for="image" class="mb-2 px-8">Upload Exhibition Images</Label>
						<!-- upload news image -->
						<FileUploadComponent
							on:imageChanges={imageChanges}
							on:imageFilesChanges={getAllImageFile}
							data={{ images: images }}
						/>
					</Label>

					<!-- upload sponsor image -->
					<Label class="space-y-2 mb-2">
						<Label for="image" class="mb-2 px-8">Upload Sponsor Images</Label>
						<FileUploadComponent
							on:imageChanges={imageChanges_sponsor}
							on:imageFilesChanges={getAllImageFile_sponsor}
							data={{ images: sponsor_images }}
						/>
					</Label>
					<!-- upload sponsor image -->
				</div>

				<!-- button for submitForm -->
				<div class="w-full flex justify-end pb-5 px-10">
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
					<TabItem open title="List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
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

							<div />
						</div>
					</TabItem>

					<TabItem title="Map">
						{#each exhibitionDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<ExpoCard
									cardType={CardType.Flat}
									title={langData.map_title}
									short_description=""
									thumbnail={exhibitionsData.image_map}
									primaryColor="bg-primary"
									startDate=""
									endDate=""
								/>
							{/if}
						{/each}
					</TabItem>

					<TabItem open title="Brochure">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each exhibitionDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Flat}
											title=""
											short_description=""
											thumbnail={brochureSourceMap[selectedLanguageTab] === ImgSourceEnum.local
												? langData.brochure
												: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
														langData.brochure
												  }`}
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
						{#each exhibitionDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<DetailPage imagesCarousel={carouselImages} long_description="" />
							{/if}
						{/each}
					</TabItem>
					<TabItem title="Sponsor">
						{#each exhibitionDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<DetailPage imagesCarousel={carouselImages_sponsor} long_description="" />
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
