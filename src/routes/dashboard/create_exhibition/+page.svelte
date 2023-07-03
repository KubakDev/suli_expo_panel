<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/exhibitionStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ExhibitionsModel, ExhibitionsModelLang } from '../../../models/exhibitionModel';
	import { DateInput } from '$lib/components/DateTimePicker';
	import { onMount } from 'svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';

	export let data;

	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let exhibitionsDataLang: ExhibitionsModelLang[] = [];

	let exhibitionsObject: ExhibitionsModel = {
		images: [],
		thumbnail: '',
		video_youtube_id: '',
		exhibition_type: '',
		exhibition_date: new Date(),
		id: 0
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		exhibitionsDataLang.push({
			title: '',
			description: '',
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
			exhibitionsObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `exhibitions/${randomText}_${file.name}`; // Append random text to the file name
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
		// console.log(response);
		exhibitionsObject.thumbnail = response.data?.path;

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`exhibitions/${randomText}_${image.name}`, image!)
				.then((response) => {
					if (response.data) {
						exhibitionsObject.images.push(response.data.path);
						// console.log('response ::::', response);
					}
				});
		}

		// Convert exhibitionsObject.images to a valid array string format
		const imagesArray = exhibitionsObject.images.map((image) => `"${image}"`);
		exhibitionsObject.images = `{${imagesArray.join(',')}}`;
		// console.log('exhibitionsObject ::::', exhibitionsObject);
		console.log('first', exhibitionsObject);
		insertData(exhibitionsObject, exhibitionsDataLang, data.supabase);

		resetForm();
		goto('/dashboard/exhibition');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		exhibitionsObject = {
			images: [],
			thumbnail: '',
			video_youtube_id: '',
			exhibition_type: '',
			exhibition_date: new Date(),
			id: 0
		};

		exhibitionsDataLang = []; // Resetting exhibitionDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			exhibitionsDataLang.push({
				title: '',
				description: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function getImagesObject() {
		carouselImages = sliderImagesFile.map((image, i) => {
			const imgUrl = URL.createObjectURL(image);
			return {
				id: i,
				imgurl: imgUrl,
				name: image,
				attribution: ''
			};
		});
		// console.log('test//', carouselImages);

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
			<h1 class="text-xl font-bold mb-8">Exhibition Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Exhibition Image</Label>
						<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>

						<Input type="date" bind:value={exhibitionsObject.exhibition_date} />
					</Label>
				</div>

				<br />
				<div class="mb-6">
					<Label for="default-input" class="block mb-2">Exhibition Type</Label>
					<Input
						bind:value={exhibitionsObject.exhibition_type}
						placeholder="Enter Exhibition Type"
					/>
				</div>
				<div class="mb-6">
					<Label for="default-input" class="block mb-2">Video youtube link</Label>
					<Input bind:value={exhibitionsObject.video_youtube_id} placeholder="Enter link" />
				</div>
				<br />

				<div class="col-span-3">
					<Tabs>
						{#each exhibitionsDataLang as langData}
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
										<Label for="textarea-id" class="mb-2">short description</Label>
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

			<!-- upload exhibition image -->
			<div>
				<Label class="space-y-2 mb-2">
					<Label for="pdf_file" class="mb-2">Upload Exhibition Image</Label>
					<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
				</Label>
			</div>

			<!-- submit Form -->
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
				<TabItem open title="Exhibition List">
					<div
						class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
						style="min-height: calc(100vh - 300px);"
					>
						<div class="flex justify-start items-start">
							{#each exhibitionsDataLang as langData}
								{#if langData.language === selectedLanguageTab}
									<h1>{exhibitionsObject.exhibition_date}</h1>
									<ExpoCard
										cardType={CardType.Main}
										title={langData.title}
										short_description={langData.description}
										thumbnail={exhibitionsObject.thumbnail}
										primaryColor="bg-primary"
										date={exhibitionsObject.exhibition_date}
									/>
								{/if}
							{/each}
						</div>

						<div />
					</div>
				</TabItem>
				<TabItem title="Exhibition Detail">
					{#each exhibitionsDataLang as langData}
						{#if langData.language === selectedLanguageTab}
							<DetailPage imagesCarousel={carouselImages} long_description="" />
						{/if}
					{/each}
				</TabItem>
			</Tabs>
		</div>
	</div>
</div>
