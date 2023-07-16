<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/media_VideoStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { VideoModel, VideoModelLang } from '../../../../models/media_VideoModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { ExhibitionModel } from '../../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	//@ts-ignore
	import { isLength, isEmpty } from 'validator';
	import EditorComponent from '$lib/components/EditorComponent.svelte';

	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	let carouselImages: any = undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let mediaVideoDataLang: VideoModelLang[] = [];
	let mediaVideoData: VideoModel = {
		id: 0,
		thumbnail: '',
		link: '',
		exhibition_type: ''
	};

	const id = $page.params.mediaVideoId;
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
	async function getVideoData() {
		await data.supabase
			.from('media_video')
			.select('*,media_video_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				mediaVideoData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					link: result.data?.link,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.thumbnail}`
				};

				// console.log('video data get db thumbnail : ////////', mediaVideoData.thumbnail);
				// console.log('video data get db images: ////////', mediaVideoData.images);
				prevThumbnail = result.data?.thumbnail;
				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.media_video_languages.findIndex(
						(mediaVideoLang: VideoModelLang) =>
							mediaVideoLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const mediaVideoLang = result.data?.media_video_languages[index];
					mediaVideoDataLang.push({
						title: mediaVideoLang?.title ?? '',
						short_description: mediaVideoLang?.short_description ?? '',
						long_description: mediaVideoLang?.long_description ?? '',
						// created_at: mediaVideoLang ? new Date(mediaVideoLang.created_at) : new Date(),
						language:
							mediaVideoLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				mediaVideoDataLang = [...mediaVideoDataLang];
				mediaVideoData = { ...mediaVideoData };
			});
	}
	onMount(async () => {
		await getVideoData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload videio image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			mediaVideoData.thumbnail = reader.result as '';

			const randomText = getRandomTextNumber();
			fileName = `mediaVideoPictures/${randomText}_${file.name}`;
		};
		reader.readAsDataURL(file);
	}

	//**Handle submit**//

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidVideoObject = false;

		for (let lang of mediaVideoDataLang) {
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

		if (!isEmpty(mediaVideoData.thumbnail) && !isEmpty(mediaVideoData.link)) {
			isValidVideoObject = true;
		}

		if (hasDataForLanguage && isValidVideoObject) {
			submitted = true;
			showToast = true;

			if (imageFile) {
				if (mediaVideoData.thumbnail) {
					await data.supabase.storage.from('image').remove([mediaVideoData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				mediaVideoData.thumbnail = response.data?.path || '';
			} else {
				mediaVideoData.thumbnail = prevThumbnail;
			}

			updateData(mediaVideoData, mediaVideoDataLang, data.supabase);
			console.log('result before store :', mediaVideoData);
			setTimeout(() => {
				showToast = false;
				goto('/dashboard/mediaVideo');
			}, 1000);
		} else {
			isFormSubmitted = true;
			return;
		}
	}

	function handleSelectChange(event: any) {
		mediaVideoData.exhibition_id = event.target.value;
		// console.log(event.target.value);
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
			<h1 class="text-2xl font-bold">Update Video Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Video Image</Label>
					<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					{#if isFormSubmitted && !mediaVideoData.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="exhibition_type" class="block font-normal">Exhibition Type</label>
					<select
						class="border border-gray-300 rounded-md w-full"
						id="type"
						name="type"
						placeholder="Please select a valid type"
						on:change={handleSelectChange}
					>
						<option disabled selected>
							{mediaVideoData.exhibition_id
								? exhibitionData.find((item) => item.id == mediaVideoData.exhibition_id)
										?.exhibition_type
								: 'Select type'}
						</option>
						{#each exhibitionData as exhibition}
							<option value={exhibition.id}>{exhibition.exhibition_type}</option>
						{/each}
					</select>
				</Label>
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="exhibition_type" class="block font-normal">Link Video</label>
					<Input
						type="text"
						placeholder="Enter title"
						bind:value={mediaVideoData.link}
						id="link"
						name="link"
					/>
					{#if isFormSubmitted && !mediaVideoData.link}
						<p class="error-message">Please Enter a link of video</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 border rounded-lg">
				<form>
					<Tabs
						activeClasses="p-4 text-primary-500 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500"
					>
						{#each mediaVideoDataLang as langData}
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
										<Label for="first_name" class="mb-2">Video Title</Label>

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
				<Tabs style="underline" class="bg-secondary rounded-tl rounded-tr">
					<TabItem open title="Magazine List">
						<div
							class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
							style="min-height: calc(100vh - 300px);"
						>
							<div class="flex justify-start items-start">
								{#each mediaVideoDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={mediaVideoData.thumbnail}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
					</TabItem>
					<TabItem title="Magazine Detail">
						{#each mediaVideoDataLang as langData}
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
