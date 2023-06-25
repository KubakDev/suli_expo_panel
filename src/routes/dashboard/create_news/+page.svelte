<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Img } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/newsStore';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { NewsModel, NewsModelLang } from '../../../models/newsModel';
	import { DateInput } from '$lib/components/DateTimePicker';
	import { onMount } from 'svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	import { filter } from 'd3';

	export let data;

	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let sliderImagesFile: File[] = [];
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let newsDataLang: NewsModelLang[] = [];

	let newsObject: NewsModel = {
		images: [],
		thumbnail: '',
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
		newsDataLang.push({
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
		const reader = new FileReader();

		reader.onloadend = () => {
			newsObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `news/${randomText}_${file.name}`;
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
				.upload(`news/${randomText}_${image.name}`, image!)
				.then((response) => {
					if (response.data) {
						newsObject.images.push(response.data.path);
					}
				});
		}

		const imagesArray = newsObject.images.map((image) => `"${image}"`);
		newsObject.images = `{${imagesArray.join(',')}}`;
		// console.log('newsObject ::::', newsObject);

		// console.log(response);
		newsObject.thumbnail = response.data?.path;

		insertData(newsObject, newsDataLang, data.supabase);

		resetForm();
		goto('/dashboard/news');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		newsObject = {
			images: [],
			thumbnail: '',
			exhibition_type: '',
			created_at: new Date(),
			id: 0
		};

		newsDataLang = []; // Resetting newsDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			newsDataLang.push({
				title: '',
				short_description: '',
				long_description: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleSelectChange(event: any) {
		newsObject.exhibition_id = event.target.value;
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

<div style="min-height: calc(100vh - 160px);" class="grid grid-col-1 lg:grid-cols-3 bg-[#f1f3f4]">
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				successfully submitted
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">News Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload News Image</Label>
						<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={newsObject.created_at} format="yyyy/MM/dd" />
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
								<option value={exhibition.id}>
									{exhibition.exhibition_type}
								</option>
							{/each}
						</select>
					</label>
				</div>

				<br />

				<div class="col-span-3">
					<Tabs>
						{#each newsDataLang as langData}
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
										<Label for="first_name" class="mb-2">News Title</Label>
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
										<Label for="textarea-id" class="mb-2">Short description</Label>
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
										<Label for="textarea-id" class="mb-2">News detail</Label>
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

			<!-- upload news image -->
			<div>
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Upload news Image</Label>
					<FileUploadComponent on:imageFilesChanges={getAllImageFile} />
				</Label>
			</div>

			<!-- button for submitForm -->
			<div class="w-full flex justify-end mt-2">
				<button
					on:click|preventDefault={formSubmit}
					type="submit"
					class="bg-primary-dark hover:bg-primary-50 text-white font-bold py-2 px-4 border border-primary-50 rounded"
				>
					Submit
				</button>
			</div>
		</Form>
	</div>
	<div class="h-full p-2 col-span-1 pt-20">
		<div>
			<Tabs style="underline">
				<TabItem open title="News List">
					<div
						class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
						style="min-height: calc(100vh - 300px);"
					>
						<div class="flex justify-start items-start">
							{#each newsDataLang as langData}
								{#if langData.language === selectedLanguageTab}
									<ExpoCard
										cardType={CardType.Main}
										title={langData.title}
										short_description={langData.short_description}
										thumbnail={newsObject.thumbnail}
										primaryColor="bg-primary"
									/>
								{/if}
							{/each}
						</div>

						<div />
					</div>
				</TabItem>
				<TabItem title="News Detail">
					{#each newsDataLang as langData}
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
