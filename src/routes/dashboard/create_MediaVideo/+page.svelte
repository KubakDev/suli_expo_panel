<script lang="ts">
	import { Label, Input, Fileupload, Textarea, InputAddon, ButtonGroup } from 'flowbite-svelte';

	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/media_VideoStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { VideoModel, VideoModelLang } from '../../../models/media_VideoModel'; 
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { onMount } from 'svelte';
	import { handleFileUpload } from '$lib/utils/handleFileUpload';

	export let data;
	let isFormSubmitted = false;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};

	let carouselImages: CarouselImage[] | undefined = undefined;

	let selectedLanguageTab = LanguageEnum.EN;

	let videoDataLang: VideoModelLang[] = [];

	let videoObjectData: VideoModel = {
		thumbnail: '',
		link: '',
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
			//
		} catch (error) {}
	};

	onMount(fetchData);
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		videoDataLang.push({
			title: '',
			short_description: '',
			long_description: '',
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidVideoObject = false;

		for (let lang of videoDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.short_description.trim();
			const longDescription = lang.long_description.trim();

			const isTitleEmpty = isEmpty(title);
			const isShortDescriptionEmpty = isEmpty(shortDescription);
			const isLongDescriptionEmpty = isEmpty(longDescription);

			if (!isTitleEmpty || !isShortDescriptionEmpty || !isLongDescriptionEmpty) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (isTitleEmpty || isShortDescriptionEmpty || isLongDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(videoObjectData.link)) {
			isValidVideoObject = true;
		}

		if (!isEmpty(videoObjectData.link)) {
			isValidVideoObject = true;
		}

		if (!hasDataForLanguage || !isValidVideoObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		if (!isEmpty(videoObjectData.thumbnail)) {
			// Upload video thumbnail image
			const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
			videoObjectData.thumbnail = response.data?.path || '';
		}

		// Insert data into Supabase
		insertData(videoObjectData, videoDataLang, data.supabase);

		resetForm();
		goto('/dashboard/mediaVideo');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		videoObjectData = {
			thumbnail: '',
			link: '',
			exhibition_type: '',
			id: 0
		};

		videoDataLang = [];
		for (let i = 0; i < languageEnumLength; i++) {
			videoDataLang.push({
				title: '',
				short_description: '',
				long_description: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleSelectChange(event: any) {
		const selectedValue = event.target.value;

		if (selectedValue === 'Select Type') {
			delete videoObjectData.exhibition_id;
		} else {
			videoObjectData.exhibition_id = selectedValue;
		}
	}

	function setImageFile(file: File) {
		imageFile = file;
	}
	function setFileName(name: string) {
		fileName = name;
	}
</script>

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">Video Data</h1></div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Video Image</Label>
					<Fileupload
						on:change={(event) =>
							handleFileUpload(
								event,
								videoObjectData,
								setImageFile,
								setFileName,
								'videoObjectData'
							)}
						accept=".jpg, .jpeg, .png"
						class="dark:bg-white"
					/>
				</Label>
			</div>
			<div class="col-span-1">
				<InsertExhibitionType {handleSelectChange} {data} />
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="exhibition_type" class="block font-normal">Link Video</label>
					<Input
						type="text"
						placeholder="Enter title"
						bind:value={videoObjectData.link}
						id="link"
						name="link"
					/>
					{#if isFormSubmitted && !videoObjectData.link}
						<p class="error-message">Please Enter a link of video</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form class="">
					<Tabs contentClass="dark:bg-gray-900">
						{#each videoDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-5 py-16">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl text-gray-700 dark:text-gray-300 font-bold">
											{#if langData.language === 'ar'}
												{`أضف البيانات إلى اللغة العربية`}
											{:else if langData.language === 'ckb'}
												{`زیاد کردنی داتا بە زمانی کوردی`}
											{:else}
												Add data for <span class="uppercase">{`${langData.language}`}</span> language
											{/if}
										</h1>
										<p>for other language navigate between tabs</p>
									</div>
									<div class="pb-10">
										<Label for="title" class="mb-2">Video Title</Label>
										<Input
											type="text"
											placeholder="Enter title"
											bind:value={langData.title}
											id="title"
											name="title"
										/>
										{#if isFormSubmitted && !langData.title.trim()}
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
										{#if isFormSubmitted && !langData.short_description.trim()}
											<p class="error-message">Please enter a short description</p>
										{/if}
									</div>

									<div class="">
										<Label for="textarea-id" class="mb-2">Video detail</Label>
										<div class="w-full" style="height: 400px;">
											<EditorComponent {langData} {isFormSubmitted} />
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border mb-2 dark:border-gray-800 mx-10" />

					<!-- submit Form -->
					<div class="w-full flex justify-end py-5 px-10">
						<button
							on:click|preventDefault={formSubmit}
							type="submit"
							class="bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
						>
							Add
						</button>
					</div>
				</form>
			</div>
			<div class="lg:col-span-1 border rounded-lg dark:border-gray-600">
				<Tabs style="underline" contentClass="dark:bg-gray-900 rounded-lg ">
					<TabItem open title="Video List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each videoDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Video}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={videoObjectData.thumbnail}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
					</TabItem>
					<TabItem title="Video Detail">
						{#each videoDataLang as langData}
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
</div>

<style>
	.error-message {
		color: red;
	}
</style>
