<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/magazineStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { MagazineModel, MagazineModelLang } from '../../../models/magazineModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { onMount } from 'svelte';
	import { exhibition, getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import CustomFileUpload from '$lib/components/CustomFileUpload.svelte';
	export let data;

	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let magazineDataLang: MagazineModelLang[] = [];

	let magazineObject: MagazineModel = {
		images: [],
		thumbnail: '',
		created_at: new Date(),
		id: 0
	};

	let exhibitionData: ExhibitionModel[] = [];
	const fetchData = async () => {
		try {
			exhibitionData = await getDataExhibition(data.supabase);
			// console.log('sdffff//////', exhibitionData);
		} catch (error) {
			console.error(error);
		}
	};

	onMount(fetchData);
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		magazineDataLang.push({
			title: '',
			short_description: '',
			long_description: '',
			created_at: new Date(),
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			magazineObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `gallery/${randomText}_${file.name}`; // Append random text to the file name

			// console.log('galleryObject////////////', galleryObject);
		};

		reader.readAsDataURL(file);
	}

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		getImagesObject();
	} //**dropzone**//

	async function formSubmit() {
		submitted = true;
		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`gallery/${randomText}_${image.name}`, image!)
				.then((response) => {
					if (response.data) {
						magazineObject.images.push(response.data.path);
						// console.log('response ::::', response);
					}
				});
		}
		// Convert magazineObject.images to a valid array string format
		const imagesArray = magazineObject.images.map((image) => `"${image}"`);
		magazineObject.images = `{${imagesArray.join(',')}}`;
		// console.log('magazineObject ::::', magazineObject);

		// console.log(response);
		magazineObject.thumbnail = response.data?.path;

		insertData(magazineObject, magazineDataLang, data.supabase);

		resetForm();
		goto('/dashboard/magazine');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		magazineObject = {
			images: [],
			thumbnail: '',
			exhibition_type: '',
			created_at: new Date(),
			id: 0
		};

		magazineDataLang = []; // Resetting galleryDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			magazineDataLang.push({
				title: '',
				short_description: '',
				long_description: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleSelectChange(event: any) {
		magazineObject.exhibition_id = event.target.value;
		// console.log('galleryObject//', galleryObject);
	}

	//get thumbnail
	function getImagesObject() {
		carouselImages = sliderImagesFile.map((image, i) => {
			// console.log('//', sliderImagesFile);
			const imgUrl = URL.createObjectURL(image);
			return {
				id: i,
				imgurl: imgUrl,
				name: image,
				attribution: ''
			};
		});
		console.log('test//', carouselImages);

		if (carouselImages.length <= 0) {
			carouselImages = undefined;
		}
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
			<h1 class="text-xl font-bold mb-8">Magazine Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Magazine Image</Label>
						<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={magazineObject.created_at} format="yyyy/MM/dd" />
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
							<option disabled selected>Select type</option>
							{#each exhibitionData as exhibition}
								<option value={exhibition.id}>{exhibition.exhibition_type}</option>
							{/each}
						</select>
					</label>
				</div>

				<br />

				<div class="col-span-3">
					<Tabs>
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

			<!-- upload magazine image -->
			<div>
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Upload Magazine Image</Label>
					<!-- <CustomFileUpload /> -->
					<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
					<!-- <FileUploadComponent /> -->
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
		<div>
			<Tabs style="underline">
				<TabItem open title="Gallery List">
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
										thumbnail={magazineObject.thumbnail}
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
								imagesCarousel={carouselImages}
								long_description={langData.long_description}
							/>
						{/if}
					{/each}
				</TabItem>
			</Tabs>
		</div>
	</div>
</div>
