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
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
	import { handleFileUpload } from '$lib/utils/handleFileUpload';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconDeviceFloppy, IconX } from '@tabler/icons-svelte';

	let loaded = false;
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
		loaded = false;
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
			loaded = true;
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

	function handleSelectChange(event: Event) {
		const selectedValue = (event.target as HTMLSelectElement).value;
		if (selectedValue === 'Select Type') {
			delete mediaVideoData.exhibition_id;
		} else {
			mediaVideoData.exhibition_id = parseInt(selectedValue, 10);
		}
	}

	function setImageFile(file: File) {
		imageFile = file;
		
		// Create an immediate preview URL
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				mediaVideoData.thumbnail = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
	function setFileName(name: string) {
		fileName = name;
	}
</script>

{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Video updated successfully!</span>
		</div>
	{/if}
	
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update Video</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Edit video content, thumbnail and external links</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Video Thumbnail</span>
						<div class="relative">
							{#if mediaVideoData.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											mediaVideoData.thumbnail = '';
											imageFile = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={(event) =>
									handleFileUpload(event, mediaVideoData, setImageFile, setFileName, 'videoObjectData')}
								accept=".jpg, .jpeg, .png"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>
					</Label>
				</div>
			</div>
			
			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<UpdateExhibitionType {handleSelectChange} pageData={mediaVideoData} {data} />
					</Label>
				</div>
			</div>

			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Video Link</span>
						<Input
							type="text"
							placeholder="Enter YouTube or other video link"
							bind:value={mediaVideoData.link}
							id="link"
							name="link"
							class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						/>
						{#if isFormSubmitted && !mediaVideoData.link}
							<p class="error-message mt-2">Please enter a video link</p>
						{/if}
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
						{#each mediaVideoDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="p-6 text-gray-700 dark:text-gray-200">
									<div class="text-center mb-8">
										<h2 class="text-xl font-semibold mb-2">
											{#if langData.language === 'ar'}
												{`عدل البيانات باللغة العربية`}
											{:else if langData.language === 'ckb'}
												{`گۆڕینی داتا بە زمانی کوردی`}
											{:else}
												Edit data for <span class="uppercase">{`${langData.language}`}</span> language
											{/if}
										</h2>
										<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to edit other languages</p>
									</div>

									<!-- Title Section -->
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
										<Label class="block">
											<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Video Title</span>
											<Input
												type="text"
												placeholder="Enter title"
												bind:value={langData.title}
												id="title"
												name="title"
												class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
											/>
											{#if isFormSubmitted && !langData.title.trim()}
												<p class="error-message mt-2">Please enter a title</p>
											{/if}
										</Label>
									</div>
									
									<!-- Short Description -->
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
										<Label class="block">
											<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Short Description</span>
											<Textarea
												placeholder="Enter short description"
												rows="4"
												bind:value={langData.short_description}
												id="short_description"
												name="short_description"
												class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
											/>
											{#if isFormSubmitted && !langData.short_description.trim()}
												<p class="error-message mt-2">Please enter a short description</p>
											{/if}
										</Label>
									</div>

									<!-- Long Description -->
									<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg pb-12">
										<div class="mb-12">
											<Label for="textarea-id" class="mb-2">Video details</Label>
											<div class="pt-4 w-full" style="height: 400px;">
												<QuillEditor placeholder="Write details..." {langData} {isFormSubmitted} />
											</div>
											{#if isFormSubmitted && !langData.long_description.trim()}
												<p class="error-message mt-2">Please enter video details</p>
											{/if}
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<!-- Submit Button -->
						<div class="flex justify-end my-6">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Update Video
							</button>
						</div>
					</div>
				</div>
			</div>
			
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-0 border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
					<Tabs style="pill" contentClass="dark:text-white p-4" class="px-4 pt-4">
						<TabItem open title="Preview">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each mediaVideoDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Video}
											title={langData.title}
											short_description={langData.short_description}
											thumbnail={mediaVideoData.thumbnail || '/src/lib/images/placeholder.png'}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>
						</TabItem>
						<TabItem title="Details">
							<div class="p-4">
								{#each mediaVideoDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<DetailPage
											imagesCarousel={carouselImages}
											long_description={langData.long_description}
										/>
									{/if}
								{/each}
							</div>
						</TabItem>
					</Tabs>
				</div>
			</div>
		</div>
	</div>
</div>
{/if}

<style>
	.error-message {
		color: #ef4444;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	.error-message::before {
		content: '!';
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		background-color: #ef4444;
		color: white;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: bold;
	}
</style>