<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/media_VideoStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { VideoModel, VideoModelLang } from '../../../../models/media_VideoModel';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
	import { handleFileUpload } from '$lib/utils/handleFileUpload';

	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	type CarouselImage = {
		attribution: string;
		id: number;
		imgurl: string;
		name: File;
	};

	let carouselImages: CarouselImage[] | undefined = undefined;

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

	//get video youtube image if exist
	const youtubeRegex =
		/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

	function getYouTubeId(url: string): string | null {
		const match = youtubeRegex.exec(url);

		return match ? match[1] : null;
	}

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
					thumbnail: result.data?.thumbnail
						? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.thumbnail}`
						: `https://img.youtube.com/vi/${getYouTubeId(result.data?.link ?? '')}/hqdefault.jpg`
				};

				//
				//
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
		const selectedValue = event.target.value;
		if (selectedValue === 'Select Type') {
			delete mediaVideoData.exhibition_id;
		} else {
			mediaVideoData.exhibition_id = selectedValue;
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
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
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
					<Fileupload
						on:change={(event) =>
							handleFileUpload(event, mediaVideoData, setImageFile, setFileName, 'videoObjectData')}
						accept=".jpg, .jpeg, .png"
						class="dark:bg-white"
					/>
				</Label>
			</div>
			<div class="col-span-1">
				<UpdateExhibitionType {handleSelectChange} pageData={mediaVideoData} {data} />
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
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form>
					<Tabs contentClass="dark:bg-gray-900">
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
					<div class="border mb-2 dark:border-gray-800 mx-10" />

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
			<div class="lg:col-span-1 border rounded-lg dark:border-gray-600">
				<Tabs style="underline" contentClass="dark:bg-gray-900">
					<TabItem open title="Video List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each mediaVideoDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Video}
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
					<TabItem title="Video Detail">
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
