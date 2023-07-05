<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/galleryStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { GalleryModel, GalleryModelLang } from '../../../../models/galleryModel';
	import { DateInput } from '$lib/components/DateTimePicker';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import type { ImagesModel } from '../../../../models/imagesModel';
	import { goto } from '$app/navigation';
	import type { ExhibitionModel } from '../../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	//@ts-ignore
	import { isLength, isEmpty } from 'validator';

	export let data;
	let sliderImagesFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let imageFile: File | undefined;
	let carouselImages: any = undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let galleryDataLang: GalleryModelLang[] = [];
	let galleryData: GalleryModel = {
		id: 0,
		images: [],
		thumbnail: '',
		exhibition_type: '',
		created_at: new Date()
	};
	const id = $page.params.galleryId;
	let images: ImagesModel[] = [];

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
	async function getDataGallery() {
		await data.supabase
			.from('gallery')
			.select('*,gallery_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				galleryData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					created_at: new Date(result.data?.created_at)
				};

				// console.log('gallery data get db thumbnail : ////////', galleryData.thumbnail);
				// console.log('gallery data get db images: ////////', galleryData.images);
				prevThumbnail = result.data?.thumbnail;
				images = getImage();
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.gallery_languages.findIndex(
						(galleryLang: GalleryModelLang) =>
							galleryLang.language == LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const galleryLang = result.data?.gallery_languages[index];
					galleryDataLang.push({
						title: galleryLang?.title ?? '',
						short_description: galleryLang?.short_description ?? '',
						long_description: galleryLang?.long_description ?? '',
						// created_at: galleryLang ? new Date(galleryLang.created_at) : new Date(),
						language:
							galleryLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				galleryDataLang = [...galleryDataLang];
				galleryData = { ...galleryData };
				getImagesObject();
			});
	}

	onMount(async () => {
		await getDataGallery();
	});

	//** for swapping between languages**//
	console.log(LanguageEnum);
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload thumbnail image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			galleryData.thumbnail = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `gallery/${randomText}_${file.name}`; // Append random text to the file name
			// console.log(galleryData);
		};
		reader.readAsDataURL(file);
	} //**for upload thumbnail image**//

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		console.log(sliderImagesFile);
	}

	//get image
	function getImage() {
		let result = galleryData.images.map((image, i) => {
			return {
				id: i,
				imgurl: image,
				imgSource: ImgSourceEnum.remote
			};
		});
		// console.log('first', result);
		return result;
	}

	//**Handle submit**//
	async function formSubmit() {
		let isValidGalleryLang = true; // Assume all languages have data
		let isValidGalleryObject = false;

		for (let lang of galleryDataLang) {
			if (
				(isEmpty(lang.title.trim()) ||
					isEmpty(lang.short_description.trim()) ||
					isEmpty(lang.long_description.trim())) &&
				!(
					isEmpty(lang.title.trim()) &&
					isEmpty(lang.short_description.trim()) &&
					isEmpty(lang.long_description.trim())
				)
			) {
				// If any field is empty and it's not the case that all fields are empty
				isValidGalleryLang = false;
				break;
			}
		}

		// Check if galleryObject has a valid thumbnail and at least one slider image
		if (!isEmpty(galleryData.thumbnail) && galleryData.images.length > 0) {
			isValidGalleryObject = true;
		}

		if (isValidGalleryLang && isValidGalleryObject) {
			submitted = true;
			showToast = true;
			galleryData.images = [];

			if (imageFile) {
				if (galleryData.thumbnail) {
					await data.supabase.storage.from('image').remove([galleryData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				galleryData.thumbnail = response.data?.path;
			} else {
				galleryData.thumbnail = prevThumbnail;
			}

			if (sliderImagesFile.length > 0) {
				for (let image of sliderImagesFile) {
					const randomText = getRandomTextNumber();
					const responseMultiple = await data.supabase.storage
						.from('image')
						.upload(`gallery/${randomText}_${image.name}`, image!);

					if (responseMultiple.data?.path) {
						galleryData.images.push(responseMultiple.data?.path);
					}
				}
			}

			for (let image of existingImages) {
				galleryData.images.push(image);
			}

			// Convert galleryObject.images to a valid array string format
			const imagesArray = galleryData.images.map((image) => `"${image}"`);
			galleryData.images = `{${imagesArray.join(',')}}`;

			updateData(galleryData, galleryDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/gallery');
			}, 1000);
		} else {
			isFormSubmitted = true;
			return;
		}
	}

	function imageChanges(e: any) {
		console.log(e.detail);
		// console.log(e.detail);
		let result: any = [];
		let customImages: any = [];
		// console.log('%%%%%%%%%%%%');
		e.detail.forEach((image: any) => {
			if (image.imgSource === ImgSourceEnum.remote) {
				result.push(image.imgurl);
				// console.log(image);
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

	function handleSelectChange(event: any) {
		galleryData.exhibition_id = event.target.value;
		// console.log(event.target.value);
	}

	//get thumbnail
	function getImagesObject() {
		carouselImages = galleryData.images.map((image, i) => {
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
			<h1 class="text-2xl font-bold">Update Gallery Data</h1>
		</div>

		<div class="flex items-center gap-4 px-4">
			<div>
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Upload Gallery Image</Label>
					<Fileupload on:change={handleFileUpload} {existingImages} />
				</Label>
			</div>
			<div>
				<label class="">
					<label for="large-input" class="block">Exhibition Type</label>
					<select
						class="border border-gray-300 rounded-md"
						id="type"
						name="type"
						placeholder="Please select a valid type"
						on:change={handleSelectChange}
					>
						<option disabled selected>
							{galleryData.exhibition_id
								? exhibitionData.find((item) => item.id == galleryData.exhibition_id)
										?.exhibition_type
								: 'Select type'}
						</option>
						{#each exhibitionData as exhibition}
							<option value={exhibition.id}>{exhibition.exhibition_type}</option>
						{/each}
					</select>
				</label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 border rounded-lg">
				<form>
					<Tabs
						activeClasses="p-4 text-primary-500 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500"
					>
						{#each galleryDataLang as langData}
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
										<Label for="first_name" class="mb-2">Gallery Title</Label>

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
					<!-- upload gallery image -->
					<div class="px-10 pt-5">
						<Label class="space-y-2 mb-2">
							<Label for="first_name" class="mb-2">Upload Gallery Images</Label>
							<FileUploadComponent
								on:imageChanges={imageChanges}
								on:imageFilesChanges={getAllImageFile}
								data={{ images: images }}
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
				<Tabs style="underline" class="bg-gray-900 rounded-tl rounded-tr">
					<TabItem open title="Gallery List">
						<div
							class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
							style="min-height: calc(100vh - 300px);"
						>
							<div class="flex justify-start items-start">
								{#each galleryDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={galleryData.thumbnail}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
					</TabItem>
					<TabItem title="Gallery Detail">
						{#each galleryDataLang as langData}
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
