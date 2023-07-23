<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/exhibitionStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { ExhibitionsModel, ExhibitionsModelLang } from '../../../../models/exhibitionModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
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
	import PDFUploadComponent from '$lib/components/pdfUpload.svelte';

	export let data;
	let sliderImagesFile: File[] = [];
	let sliderPDFFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let existingPDFfiles: string[] = [];
	let imageFile: File | undefined;
	let carouselImages: any = undefined;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let exhibitionDataLang: ExhibitionsModelLang[] = [];
	let exhibitionsData: ExhibitionsModel = {
		id: 0,
		images: [],
		pdf_files: [],
		thumbnail: '',
		country_number: 0,
		company_number: 0,
		exhibition_type: '',
		deleted_status: '',
		start_date: new Date(),
		end_date: new Date()
	};
	const id = $page.params.exhibitionId;
	let images: ImagesModel[] = [];
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
					pdf_files: result.data?.pdf_files,
					exhibition_type: result.data?.exhibition_type,
					deleted_status: result.data?.deleted_status,
					company_number: result.data?.company_number,
					country_number: result.data?.country_number,
					start_date: new Date(result.data?.start_date),
					end_date: new Date(result.data?.end_date)
				};

				prevThumbnail = result.data?.thumbnail;
				images = getImage();
				pdf_files = getPdfFile();
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

						language:
							exhibitionLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				exhibitionDataLang = [...exhibitionDataLang];
				exhibitionsData = { ...exhibitionsData };
				getImagesObject();
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

	//**for upload exhibition image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			exhibitionsData.thumbnail = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `exhibition/${randomText}_${file.name}`; // Append random text to the file name
			// console.log(exhibitionsData);
		};
		reader.readAsDataURL(file);
	} //**for upload exhibition image**//

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		// console.log(sliderImagesFile);
	}

	//**pdf files**//

	function getAllPDFFile(e: { detail: File[] }) {
		sliderPDFFile = e.detail;
	}

	//**pdf files**//

	//get image
	function getImage() {
		let result = exhibitionsData.images.map((image, i) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		// console.log('first', result);
		return result;
	}

	//get pdf File
	function getPdfFile() {
		let result = exhibitionsData.pdf_files.map((file, i) => {
			return {
				id: i,
				imgurl: file,
				imgSource: ImgSourceEnum.PdfRemote
			};
		});
		// console.log('first pdf file ', result);
		return result;
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

			const isStoryIsEmpty = isEmpty(storyData);
			const isTitleEmpty = isEmpty(title);
			const isShortDescriptionEmpty = isEmpty(shortDescription);
			const isLinkEmpty = isEmpty(link);

			if (!isStoryIsEmpty || !isTitleEmpty || !isShortDescriptionEmpty || !isLinkEmpty) {
				// At least one field is not empty
				hasDataForLanguage = true;
				if (isStoryIsEmpty || isTitleEmpty || isShortDescriptionEmpty || isLinkEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (
			!isEmpty(exhibitionsData.thumbnail) &&
			exhibitionsData.images.length > 0 &&
			exhibitionsData.country_number > 0 &&
			exhibitionsData.company_number > 0 &&
			!isEmpty(exhibitionsData.exhibition_type)
		) {
			isValidExhibitionObject = true;
		}

		if (hasDataForLanguage && isValidExhibitionObject) {
			showToast = true;
			exhibitionsData.pdf_files = [];
			exhibitionsData.images = [];
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

			if (sliderImagesFile.length > 0) {
				for (let image of sliderImagesFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`exhibition/${randomText}_${image.name}`, image!);
					// console.log('responseMultiple img:', responseMultiple);

					if (responseMultiple.data?.path) {
						exhibitionsData.images.push(responseMultiple.data?.path);
					}
				}
			}
			for (let image of existingImages) {
				exhibitionsData.images.push(image);
			}
			// Convert exhibition.images to a valid array string format
			const imagesArray = exhibitionsData.images.map((image) => `"${image}"`);
			exhibitionsData.images = `{${imagesArray.join(',')}}`;

			// ***insert pdf *****//
			if (sliderPDFFile.length > 0) {
				for (let PDFfile of sliderPDFFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('PDF')
						.upload(`pdfFiles/${randomText}_${PDFfile.name}`, PDFfile!);
					// console.log('responseMultiple pdf:', responseMultiple);

					if (responseMultiple.data?.path) {
						exhibitionsData.pdf_files.push(responseMultiple.data.path);
					}
				}
			}
			for (let pdf of existingPDFfiles) {
				exhibitionsData.pdf_files.push(pdf);
			}
			// Convert exhibition.images to a valid array string format
			const pdfArray = exhibitionsData.pdf_files.map((file) => `"${file}"`);
			exhibitionsData.pdf_files = `{${pdfArray.join(',')}}`;

			updateData(exhibitionsData, exhibitionDataLang, data.supabase);
			console.log('result before store :', exhibitionsData);
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
		// console.log(e.detail);
		let result: any = [];
		let customImages: any = [];
		e.detail.forEach((image: any) => {
			if (image.imgSource === ImgSourceEnum.remote) {
				result.push(image.imgurl);
				// console.log('///////', image);
				const newImage = { ...image };
				newImage.imgurl = `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image.imgurl}`;
				customImages.push(newImage);
			} else {
				customImages.push(image);
			}
		});
		carouselImages = customImages;
		existingImages = result;
		// console.log('carouselImages data :::::', carouselImages);
	}

	//update pdf file
	function pdfChanges(e: any) {
		// console.log(e.detail);
		let result: any = [];
		let customImages: any = [];
		e.detail.forEach((files: any) => {
			if (files.imgSource === ImgSourceEnum.PdfRemote) {
				result.push(files.imgurl);
				const newFile = { ...files };
				newFile.imgurl = `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL_PDF}/${files.imgurl}`;
				// customImages.push(newFile);
				console.log('first');
			} else {
				// customImages.push(files);
			}
		});
		existingPDFfiles = result;
		// console.log('carouselImages data :::::', existingPDFfiles);
	}

	function getImagesObject() {
		carouselImages = exhibitionsData.images.map((image, i) => {
			return {
				id: i,
				imgurl: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`,
				imgSource: ImgSourceEnum.remote,
				name: image,
				attribution: ''
			};
		});
		// console.log('print //', carouselImages);

		if (carouselImages.length <= 0) {
			carouselImages = undefined;
		}
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

		<div class="grid lg:grid-cols-3 gap-4 px-4 py-2">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Exhibition Image</Label>
					<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					{#if isFormSubmitted && !exhibitionsData.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<span>Start Date</span>
					<Input type="date" bind:value={exhibitionsData.start_date} />
				</Label>
			</div>
			<div class="col-span-1">
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
					/>
					{#if isFormSubmitted && !exhibitionsData.company_number}
						<p class="error-message">Required</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 border rounded-lg">
				<form>
					<Tabs
						activeClasses="p-4 text-primary-500 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500"
					>
						{#each exhibitionDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-10 py-10">
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

									<div class="col-span-3">
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
										<Label for="first_name" class="mb-2">Exhibition Title</Label>

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
										<Label for="textarea-id" class="mb-2">story</Label>
										<Textarea
											placeholder="Enter a story"
											rows="4"
											bind:value={langData.story}
											id="story"
											name="story"
										/>
										{#if !langData.story.trim()}
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
										{#if !langData.description.trim()}
											<p class="error-message">Please enter a description</p>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
					<div class="border mb-2 border-gray-300 mx-10" />
				</form>

				<div class="grid lg:grid-cols-2 pt-5">
					<!-- upload Exhibition image -->
					<Label class="space-y-2 mb-2">
						<Label for="image" class="mb-2 px-8">Upload Exhibition Images</Label>
						<FileUploadComponent
							on:imageChanges={imageChanges}
							on:imageFilesChanges={getAllImageFile}
							data={{ images: images }}
						/>
					</Label>

					<!-- upload pdf file -->

					<Label class="space-y-2 mb-2">
						<Label for="pdf" class="mb-2 px-8">Upload PDF Files</Label>
						<PDFUploadComponent
							on:imageChanges={pdfChanges}
							on:imageFilesChanges={getAllPDFFile}
							data={{ pdfFiles: pdf_files }}
						/>
					</Label>
				</div>

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
			<div class="lg:col-span-1 border rounded-lg">
				<Tabs style="underline" class="bg-secondary rounded-tl rounded-tr">
					<TabItem open title="Exhibition List">
						<div
							class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
							style="min-height: calc(100vh - 300px);"
						>
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
					<TabItem title="Exhibition Detail">
						{#each exhibitionDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<DetailPage bind:imagesCarousel={carouselImages} long_description="" />
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
