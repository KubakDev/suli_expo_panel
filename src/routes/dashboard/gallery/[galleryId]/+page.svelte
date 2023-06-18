<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { updateData } from '../../../../stores/galleryStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { GalleryModel, GalleryModelLang } from '../../../../models/galleryModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';
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
	import Editor from '@tinymce/tinymce-svelte';
	import EditorComponent from '$lib/components/EditorComponent.svelte';

	export let data;
	let sliderImagesFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let imageFile: File | undefined;
	let carouselImages: any = undefined;
	let submitted = false;
	let showToast = false;

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
			// console.log('exhibitionData//////', exhibitionData);
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
		submitted = true;
		showToast = true;
		galleryData.images = [];
		if (imageFile) {
			if (galleryData.thumbnail) {
				await data.supabase.storage.from('image').remove([galleryData.thumbnail]);
			}

			const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
			galleryData.thumbnail = response.data?.path;
		}

		if (sliderImagesFile.length > 0) {
			for (let image of sliderImagesFile) {
				const randomText = getRandomTextNumber();
				const responseMultiple = await data.supabase.storage
					.from('image')
					.upload(`gallery/${randomText}_${image.name}`, image!);
				// console.log('responseMultiple:', responseMultiple);

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
		}, 1000);
		goto('/dashboard/gallery');
	}

	function imageChanges(e: any) {
		console.log(e.detail);
		// console.log(e.detail);
		let result: any = [];
		let customImages: any = [];
		console.log('%%%%%%%%%%%%');
		e.detail.forEach((image: any) => {
			if (image.imgSource === ImgSourceEnum.remote) {
				result.push(image.imgurl);
				console.log(image);
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

<div style="min-height: calc(100vh - 160px);" class="grid grid-col-1 lg:grid-cols-3 bg-[#f1f3f4]">
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				The Update Was Successfully!
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">Gallery Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Gallery Image</Label>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={galleryData.created_at} />
					</Label>
				</div>
				<div>
					<label class="space-y-2 mb-2">
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
				<br />

				<div class="col-span-3">
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
										<!-- <Message name="title" /> -->
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
										<!-- <Message name="short_description" /> -->
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">long description</Label>
										<div class="pt-4 w-full" style="height: 400px;">
											<EditorComponent {langData} />
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>

			<!-- upload gallery image -->
			<div>
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
			<div class="w-full flex justify-end mt-2">
				<button
					on:click|preventDefault={formSubmit}
					type="submit"
					class="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 border border-blue-700 rounded"
				>
					Submit
				</button>
			</div>
		</Form>
	</div>
	<div class="h-full p-2 col-span-1 pt-20">
		<Tabs style="underline">
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
