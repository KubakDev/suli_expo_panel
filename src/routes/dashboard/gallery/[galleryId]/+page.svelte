<script lang="ts">
	import { Label, Input, Fileupload, Textarea, ButtonGroup, InputAddon } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/galleryStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { GalleryModel, GalleryModelLang } from '../../../../models/galleryModel';
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
	import { isEmpty } from 'validator';

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

				//
				//
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

	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload thumbnail image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			galleryData.thumbnail = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `gallery/${randomText}_${file.name}`; // Append random text to the file name
			//
		};
		reader.readAsDataURL(file);
	} //**for upload thumbnail image**//

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
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
		//
		return result;
	}

	//**Handle submit**//
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidGalleryObject = false;

		for (let lang of galleryDataLang) {
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

		if (!isEmpty(galleryData.thumbnail) && galleryData.images.length > 0) {
			isValidGalleryObject = true;
		}
		if (hasDataForLanguage && isValidGalleryObject) {
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
				galleryData.thumbnail = response.data?.path || '';
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
		//
		let result: any = [];
		let customImages: any = [];
		//
		e.detail.forEach((image: any) => {
			if (image.imgSource === ImgSourceEnum.remote) {
				result.push(image.imgurl);
				//
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

	function handleSelectChange(event: any) {
		const selectedValue = event.target.value;
		if (selectedValue === 'Select Type') {
			delete galleryData.exhibition_id;
		} else {
			galleryData.exhibition_id = selectedValue;
		}
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
		//

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
			<h1 class="text-2xl font-bold">Update Gallery Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Gallery Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class="dark:bg-white"
					/>
					{#if isFormSubmitted && !galleryData.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="exhibition_type" class="block font-normal">Exhibition Type</label>
					<ButtonGroup class="w-full">
						<select
							class="dark:text-gray-900 border border-gray-300 rounded-l-md w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
							id="type"
							name="type"
							on:change={handleSelectChange}
						>
							<!-- Use JavaScript ternary operator to handle selected option -->
							<option value="Select Type" selected={galleryData.exhibition_id === undefined}>
								Select Type
							</option>
							{#each exhibitionData as exhibition}
								<!-- Use JavaScript ternary operator to handle selected option -->
								<option
									value={exhibition.id}
									selected={galleryData.exhibition_id === exhibition.id}
								>
									{exhibition.exhibition_type}
								</option>
							{/each}
						</select>
						<InputAddon class="bg-white ">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
								<path d="M0 0h24v24H0z" fill="none" />
								<path
									d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 2v3H6V4h12zM5 20V9h14v11H5zm3-7h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
								/>
							</svg>
						</InputAddon>
					</ButtonGroup>
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form>
					<Tabs contentClass="dark:bg-gray-900">
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
					<div class="border mb-2 dark:border-gray-800 mx-10" />
				</form>

				<!-- upload gallery image -->
				<div class="px-4 pt-5">
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2 px-8">Upload Gallery Images</Label>
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
			</div>
			<div class="lg:col-span-1 border rounded-lg dark:border-gray-600">
				<Tabs style="underline" contentClass="dark:bg-gray-900">
					<TabItem open title="Gallery List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
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
