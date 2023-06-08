<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { updateData, gallery } from '../../../../stores/galleryStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { GalleryModel, GalleryModelLang } from '../../../../models/galleryModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { onMount } from 'svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import type { ImagesModel } from '../../../../models/imagesModel';

	export let data;
	let sliderImagesFile: File[] = [];
	let fileName: string;
	let existingImages: string[] = [];
	let imageFile: File | undefined;
	const galleryFiles: { file: File; fileName: string }[] = [];
	let submitted = false;
	let showToast = false;

	let galleryDataLang: GalleryModelLang[] = [];
	let galleryData: GalleryModel = {
		id: 0,
		images: [],
		thumbnail: '',
		created_at: new Date()
	};
	const id = $page.params.galleryId;
	let images: ImagesModel[] = [];
	async function getDataGallery() {
		await data.supabase
			.from('gallery')
			.select('*,gallery_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				galleryData = {
					id: result.data?.id,
					images: result.data?.images,
					thumbnail: result.data?.thumbnail,
					created_at: new Date(result.data?.created_at)
				};
				// console.log(galleryData.images);
				console.log(galleryData.thumbnail);
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
			});
	}

	onMount(async () => {
		await getDataGallery();
	});

	//**** get data from db and put it into the fields ****//

	//** for swapping between language**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between language**//

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

		// console.log('////', e.detail);
	}

	//get image
	function getImage() {
		let result = galleryData.images.map((image, i) => {
			// console.log('///', image);

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
	}

	function imageChanges(e) {
		// console.log(e.detail);
		let result: any = [];

		e.detail.forEach((image) => {
			if (image.imgSource === ImgSourceEnum.remote) {
				result.push(image.imgurl);
			}
		});
		existingImages = result;
		console.log('image data :::::', result);
	}
</script>

<div
	style="min-height: calc(100vh - 160px);"
	class="grid sm:grid-col-2 xl:grid-cols-3 bg-[#f1f3f4]"
>
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				successfully submitted
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

				<br />

				<div class="col-span-3">
					<Tabs>
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
										<Textarea
											placeholder="Enter long description"
											rows="4"
											bind:value={langData.long_description}
											id="long_description"
											name="long_description"
										/>
										<!-- <Message name="long_description" /> -->
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
					<Label for="first_name" class="mb-2">Upload Gallery Image</Label>
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
</div>
