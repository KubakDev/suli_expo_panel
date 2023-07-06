<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { updateData } from '../../../../stores/magazineStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { MagazineModel, MagazineModelLang } from '../../../../models/magazineModel';
	import { DateInput } from '$lib/components/DateTimePicker';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import PDFUploadComponent from '$lib/components/pdfUpload.svelte';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import type { ImagesModel } from '../../../../models/imagesModel';
	import type { PDFModel } from '../../../../models/pdfModel';
	import { goto } from '$app/navigation';
	import type { ExhibitionModel } from '../../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	//@ts-ignore
	import { isLength, isEmpty } from 'validator';

	export let data;
	let sliderImagesFile: File[] = [];
	let sliderPDFFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let existingPDFfiles: string[] = [];
	let imageFile: File | undefined;
	let pdfFiles: File[] = [];
	let carouselImages: any = undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let magazineDataLang: MagazineModelLang[] = [];
	let magazineData: MagazineModel = {
		id: 0,
		images: [],
		thumbnail: '',
		pdf_files: [],
		exhibition_type: '',
		created_at: new Date()
	};
	const id = $page.params.magazineId;
	let images: ImagesModel[] = [];
	let pdf_files: PDFModel[] = [];
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

	//**** get data from db and put it into the fields ****//
	async function getMagazineData() {
		await data.supabase
			.from('magazine')
			.select('*,magazine_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				magazineData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					pdf_files: result.data?.pdf_files,
					created_at: new Date(result.data?.created_at)
				};

				console.log('magazine data get db pdf files : ////////', magazineData.pdf_files);
				console.log('magazine data get db images: ////////', magazineData.images);

				prevThumbnail = result.data?.thumbnail;
				images = getImage();
				pdf_files = getPdfFile();
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.magazine_languages.findIndex(
						(magazineLang: MagazineModelLang) =>
							magazineLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const magazineLang = result.data?.magazine_languages[index];
					magazineDataLang.push({
						title: magazineLang?.title ?? '',
						short_description: magazineLang?.short_description ?? '',
						long_description: magazineLang?.long_description ?? '',
						// created_at: magazineLang ? new Date(magazineLang.created_at) : new Date(),
						language:
							magazineLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				magazineDataLang = [...magazineDataLang];
				magazineData = { ...magazineData };
				getImagesObject();
			});
	}

	onMount(async () => {
		await getMagazineData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload magazine image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			magazineData.thumbnail = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `magazine/${randomText}_${file.name}`; // Append random text to the file name
			// console.log(magazineData);
		};
		reader.readAsDataURL(file);
	} //**for upload magazine image**//

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
		let result = magazineData.images.map((image, i) => {
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
		let result = magazineData.pdf_files.map((file, i) => {
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
		let isValidMagazineObject = false;

		for (let lang of magazineDataLang) {
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

		if (!isEmpty(magazineData.thumbnail) && magazineData.images.length > 0) {
			isValidMagazineObject = true;
		}

		if (hasDataForLanguage && isValidMagazineObject) {
			submitted = true;
			showToast = true;
			magazineData.pdf_files = [];
			magazineData.images = [];
			if (imageFile) {
				if (magazineData.thumbnail) {
					await data.supabase.storage.from('image').remove([magazineData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				magazineData.thumbnail = response.data?.path;
			} else {
				magazineData.thumbnail = prevThumbnail;
			}

			if (sliderImagesFile.length > 0) {
				for (let image of sliderImagesFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`magazine/${randomText}_${image.name}`, image!);
					// console.log('responseMultiple img:', responseMultiple);

					if (responseMultiple.data?.path) {
						magazineData.images.push(responseMultiple.data?.path);
					}
				}
			}
			for (let image of existingImages) {
				magazineData.images.push(image);
			}
			// Convert magazine.images to a valid array string format
			const imagesArray = magazineData.images.map((image) => `"${image}"`);
			magazineData.images = `{${imagesArray.join(',')}}`;

			// ***insert pdf *****//
			if (sliderPDFFile.length > 0) {
				for (let PDFfile of sliderPDFFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('PDF')
						.upload(`pdfFiles/${randomText}_${PDFfile.name}`, PDFfile!);
					// console.log('responseMultiple pdf:', responseMultiple);

					if (responseMultiple.data?.path) {
						magazineData.pdf_files.push(responseMultiple.data.path);
					}
				}
			}
			for (let pdf of existingPDFfiles) {
				magazineData.pdf_files.push(pdf);
			}
			// Convert magazine.images to a valid array string format
			const pdfArray = magazineData.pdf_files.map((file) => `"${file}"`);
			magazineData.pdf_files = `{${pdfArray.join(',')}}`;

			updateData(magazineData, magazineDataLang, data.supabase);
			console.log('result before store :', magazineData);
			setTimeout(() => {
				showToast = false;
				goto('/dashboard/magazine');
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

	function handleSelectChange(event: any) {
		magazineData.exhibition_id = event.target.value;
		// console.log(event.target.value);
	}

	function getImagesObject() {
		carouselImages = magazineData.images.map((image, i) => {
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
		<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			The Update Was Successfully!
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10">
			<h1 class="text-2xl font-bold">Update Magazine Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Gallery Image</Label>
					<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					{#if isFormSubmitted && !magazineData.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="exhibition_type" class="block font-normal">Exhibition Type</label>
					<select
						class="border border-gray-300 rounded-md w-full"
						id="type"
						name="type"
						placeholder="Please select a valid type"
						on:change={handleSelectChange}
					>
						<option disabled selected>
							{magazineData.exhibition_id
								? exhibitionData.find((item) => item.id == magazineData.exhibition_id)
										?.exhibition_type
								: 'Select type'}
						</option>
						{#each exhibitionData as exhibition}
							<option value={exhibition.id}>{exhibition.exhibition_type}</option>
						{/each}
					</select>
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 border rounded-lg">
				<form>
					<Tabs
						activeClasses="p-4 text-primary-500 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500"
					>
						{#each magazineDataLang as langData}
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
										<Label for="first_name" class="mb-2">Magazine Title</Label>

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
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">long description</Label>
										<div class="pt-4 w-full" style="height: 400px;">
											<EditorComponent {langData} {isFormSubmitted} />
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
					<div class="border mb-2 border-gray-300 mx-10" />

					<div class="grid lg:grid-cols-2 gap-4 px-8 pt-5">
						<!-- upload magazine image -->

						<Label class="space-y-2 mb-2">
							<Label for="first_name" class="mb-2">Upload Magazine Images</Label>
							<FileUploadComponent
								on:imageChanges={imageChanges}
								on:imageFilesChanges={getAllImageFile}
								data={{ images: images }}
							/>
						</Label>

						<!-- upload pdf file -->

						<Label class="space-y-2 mb-2">
							<Label for="first_name" class="mb-2">Upload PDF Files</Label>
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
				</form>
			</div>
			<div class="lg:col-span-1 border rounded-lg">
				<Tabs style="underline" class="bg-secondary rounded-tl rounded-tr">
					<TabItem open title="Magazine List">
						<div
							class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
							style="min-height: calc(100vh - 300px);"
						>
							<div class="flex justify-start items-start">
								{#each magazineDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={magazineData.thumbnail}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
					</TabItem>
					<TabItem title="Gallery Detail">
						{#each magazineDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<DetailPage
									bind:imagesCarousel={carouselImages}
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
