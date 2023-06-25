<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/publishingStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { PublishingModel, PublishingModelLang } from '../../../models/publishingModel';
	import { DateInput } from '$lib/components/DateTimePicker';
	import { onMount } from 'svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import PDFUploadComponent from '$lib/components/pdfUpload.svelte';
	import EditorComponent from '$lib/components/EditorComponent.svelte';

	export let data;

	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let pdfFiles: File[] = [];
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let publishingDataLang: PublishingModelLang[] = [];

	let publishingObject: PublishingModel = {
		images: [],
		thumbnail: '',
		pdf_files: [],
		created_at: new Date(),
		id: 0
	};

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
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		publishingDataLang.push({
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
			publishingObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `publishing/${randomText}_${file.name}`; // Append random text to the file name
		};

		reader.readAsDataURL(file);
	}

	//**dropzone**//
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
		getImagesObject();
	} //**dropzone**//

	//**pdf files**//

	function getAllPDFFile(e: { detail: File[] }) {
		pdfFiles = e.detail;
	}

	//**pdf files**//
	async function formSubmit() {
		submitted = true;
		showToast = true;

		// Upload publishing thumbnail image
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		publishingObject.thumbnail = response.data?.path;

		// Upload PDF files
		for (let pdf of pdfFiles) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('PDF')
				.upload(`pdfFiles/${randomText}_${pdf.name}`, pdf)
				.then((response) => {
					if (response.data) {
						publishingObject.pdf_files.push(response.data.path);
					}
				});
		}

		for (let image of sliderImagesFile) {
			const randomText = getRandomTextNumber();
			await data.supabase.storage
				.from('image')
				.upload(`publishing/${randomText}_${image.name}`, image!)
				.then((response) => {
					if (response.data) {
						publishingObject.images.push(response.data.path);
					}
				});
		}

		// Convert publishingObject.images and publishingObject.pdf_files to valid array string format
		const imagesArray = publishingObject.images.map((image) => `"${image}"`);
		const pdfFilesArray = publishingObject.pdf_files.map((pdf) => `"${pdf}"`);
		publishingObject.images = `{${imagesArray.join(',')}}`;
		publishingObject.pdf_files = `{${pdfFilesArray.join(',')}}`;

		// Insert data into Supabase
		insertData(publishingObject, publishingDataLang, data.supabase);

		resetForm();
		goto('/dashboard/publishing');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		publishingObject = {
			images: [],
			thumbnail: '',
			pdf_files: '',
			exhibition_type: '',
			created_at: new Date(),
			id: 0
		};

		publishingDataLang = []; // Resettinet publishingDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			publishingDataLang.push({
				title: '',
				short_description: '',
				long_description: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleSelectChange(event: any) {
		publishingObject.exhibition_id = event.target.value;
		// console.log('publishingObject//', publishingObject);
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
			<h1 class="text-xl font-bold mb-8">publishing Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload publishing Image</Label>
						<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={publishingObject.created_at} format="yyyy/MM/dd" />
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

				<!-- upload PDF file  -->

				<br />

				<div class="col-span-3">
					<Tabs>
						{#each publishingDataLang as langData}
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
										<Label for="first_name" class="mb-2">publishing Title</Label>
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
										<Label for="textarea-id" class="mb-2">publishing detail</Label>
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

			<!-- upload publishing image -->
			<div>
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Upload publishing Image</Label>
					<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
					<!-- <FileUploadComponent /> -->
				</Label>
			</div>

			<!-- upload pdf file -->
			<div class="py-20">
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Upload PDF Files</Label>
					<PDFUploadComponent on:imageFilesChanges={getAllPDFFile} />
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
				<TabItem open title="publishing List">
					<div
						class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
						style="min-height: calc(100vh - 300px);"
					>
						<div class="flex justify-start items-start">
							{#each publishingDataLang as langData}
								{#if langData.language === selectedLanguageTab}
									<ExpoCard
										cardType={CardType.Main}
										title={langData.title}
										short_description={langData.short_description}
										thumbnail={publishingObject.thumbnail}
										primaryColor="bg-primary"
									/>
								{/if}
							{/each}
						</div>

						<div />
					</div>
				</TabItem>
				<TabItem title="publishing Detail">
					{#each publishingDataLang as langData}
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
