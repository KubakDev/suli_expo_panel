<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
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
	import { getDataExhibition } from '../../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import type { ExhibitionModel } from '../../../../models/exhibitionTypeModel';

	export let data;
	let sliderImagesFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let imageFile: File | undefined;
	let carouselImages: any = undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';

	let exhibitionDataLang: ExhibitionsModelLang[] = [];
	let exhibitionsData: ExhibitionsModel = {
		id: 0,
		images: [],
		thumbnail: '',
		video_youtube_id: '',
		exhibition_type: '',
		exhibition_date: new Date()
	};
	const id = $page.params.exhibitionId;
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
	async function getExhibitionData() {
		await data.supabase
			.from('exhibition')
			.select('*,exhibition_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				exhibitionsData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					images: result.data?.images,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					video_youtube_id: result.data?.video_youtube_id,
					exhibition_type: result.data?.exhibition_type,
					exhibition_date: result.data?.exhibition_date
				};
				console.log('date value ///////', exhibitionsData.exhibition_date);
				prevThumbnail = result.data?.thumbnail;
				images = getImage();
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.exhibition_languages.findIndex(
						(exhibitionLang: ExhibitionsModelLang) =>
							exhibitionLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const exhibitionLang = result.data?.exhibition_languages[index];
					exhibitionDataLang.push({
						title: exhibitionLang?.title ?? '',
						description: exhibitionLang?.description ?? '',
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

	//**for upload thumbnail image**//
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

	//**Handle submit**//
	async function formSubmit() {
		submitted = true;
		showToast = true;
		exhibitionsData.images = [];
		if (imageFile) {
			if (exhibitionsData.thumbnail) {
				await data.supabase.storage.from('image').remove([exhibitionsData.thumbnail]);
			}

			const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
			console.log(response.data);
			exhibitionsData.thumbnail = response.data?.path;
		} else {
			exhibitionsData.thumbnail = prevThumbnail;
		}

		if (sliderImagesFile.length > 0) {
			for (let image of sliderImagesFile) {
				const randomText = getRandomTextNumber();
				const responseMultiple = await data.supabase.storage
					.from('image')
					.upload(`exhibition/${randomText}_${image.name}`, image!);
				// console.log('responseMultiple:', responseMultiple);

				if (responseMultiple.data?.path) {
					exhibitionsData.images.push(responseMultiple.data?.path);
				}
			}
		}
		for (let image of existingImages) {
			exhibitionsData.images.push(image);
		}
		// Convert galleryObject.images to a valid array string format
		const imagesArray = exhibitionsData.images.map((image) => `"${image}"`);
		exhibitionsData.images = `{${imagesArray.join(',')}}`;
		console.log(exhibitionsData);
		updateData(exhibitionsData, exhibitionDataLang, data.supabase);

		setTimeout(() => {
			showToast = false;
		}, 1000);
		goto('/dashboard/exhibition');
	}

	function imageChanges(e: any) {
		console.log(e.detail);
		// console.log(e.detail);
		let result: any = [];
		let customImages: any = [];

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

	//get thumbnail
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

<div style="min-height: calc(100vh - 160px);" class="grid grid-col-1 lg:grid-cols-3 bg-[#f1f3f4]">
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				The Update Was Successfully!
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">Exhibition Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Exhibition Image</Label>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>

				<div>
					<Label class="space-y-2 mb-2">
						<Label for="default-input" class="block mb-2">Exhibition Type</Label>
						<Input type="date" bind:value={exhibitionsData.exhibition_date} />
					</Label>
				</div>
				<br />
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="default-input" class="block mb-2">Exhibition Type</Label>
						<Input bind:value={exhibitionsData.exhibition_type} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="default-input" class="block mb-2">Video youtube link</Label>
						<Input bind:value={exhibitionsData.video_youtube_id} />
					</Label>
				</div>

				<br />

				<div class="col-span-3">
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
										<Label for="first_name" class="mb-2">Exhibition Title</Label>
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
										<Label for="textarea-id" class="mb-2">Exhibition description</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.description}
											id="short_description"
											name="short_description"
										/>
										<!-- <Message name="short_description" /> -->
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>

			<!-- upload Exhibition image -->
			<div>
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Upload Exhibition Images</Label>
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
			<TabItem open title="Exhibition List">
				<div
					class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
					style="min-height: calc(100vh - 300px);"
				>
					<div class="flex justify-start items-start">
						{#each exhibitionDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<ExpoCard
									cardType={CardType.Square}
									title={langData.title}
									thumbnail={exhibitionsData.thumbnail}
									primaryColor="bg-primary"
									created_at={exhibitionsData.exhibition_date}
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
