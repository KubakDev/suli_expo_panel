<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/aboutStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { AboutModel, AboutModelLang } from '../../../../models/aboutModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import { IconX, IconDeviceFloppy } from '@tabler/icons-svelte';

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
	let loaded = false;
	let aboutDataLang: AboutModelLang[] = [];
	let aboutData: AboutModel = {
		id: 0,
		image: '',
		created_at: new Date()
	};
	const id = $page.params.aboutId;

	//**** get data from db and put it into the fields ****//
	async function getAboutData() {
		loaded = false;
		await data.supabase
			.from('about')
			.select('*,about_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				aboutData = {
					id: result.data?.id,
					image: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.image}`,
					created_at: new Date(result.data?.created_at)
				};

				prevThumbnail = result.data?.image;

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.about_languages.findIndex(
						(aboutLang: AboutModelLang) =>
							aboutLang.language == LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const aboutLang = result.data?.about_languages[index];
					aboutDataLang.push({
						short_description: aboutLang?.short_description ?? '',
						long_description: aboutLang?.long_description ?? '',
						language:
							aboutLang?.language ?? LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				aboutDataLang = [...aboutDataLang];
				aboutData = { ...aboutData };
				loaded = true;
			});
	}

	onMount(async () => {
		await getAboutData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload image image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			aboutData.image = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `about/${randomText}`; // Append random text to the file name
			//
		};
		reader.readAsDataURL(file);
	} //**for upload image image**//

	//**Handle submit**//
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidAboutObject = false;

		for (let lang of aboutDataLang) {
			const shortDescription = lang.short_description.trim();
			const longDescription = lang.long_description.trim();

			const isShortDescriptionEmpty = isEmpty(shortDescription);
			const isLongDescriptionEmpty = isEmpty(longDescription);

			if (!isShortDescriptionEmpty || !isLongDescriptionEmpty) {
				// At least one field is not empty
				hasDataForLanguage = true;
				if (isShortDescriptionEmpty || isLongDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(aboutData.image)) {
			isValidAboutObject = true;
		}

		if (hasDataForLanguage && isValidAboutObject) {
			submitted = true;
			showToast = true;

			if (imageFile) {
				if (aboutData.image) {
					await data.supabase.storage.from('image').remove([aboutData.image]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				aboutData.image = response?.data?.path;
			} else {
				aboutData.image = prevThumbnail;
			}
			//
			updateData(aboutData, aboutDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/about');
			}, 1000);
		} else {
			isFormSubmitted = true;
			return;
		}
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
			<span class="font-medium">About information updated successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update About</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Edit about information and update image</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-8">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">About Image</span>
						<div class="relative">
							{#if aboutData.image}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											aboutData.image = '';
											imageFile = undefined;
										}}
									>
										<IconX size={16} />
									</button>
								</div>
							{/if}
							<Fileupload
								on:change={handleFileUpload}
								accept=".jpg, .jpeg, .png, .svg"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>
						{#if isFormSubmitted && !aboutData?.image?.trim()}
							<p class="error-message mt-2">Please upload an image</p>
						{/if}
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
							{#each aboutDataLang as langData}
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
													{`أضف البيانات إلى اللغة العربية`}
												{:else if langData.language === 'ckb'}
													{`زیاد کردنی داتا بە زمانی کوردی`}
												{:else}
													{`English Language Content`}
												{/if}
											</h2>
											<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to edit other languages</p>
										</div>

										<!-- Short Description Section -->
										<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Short Description</span>
												<Textarea
													placeholder="Enter short description"
													rows="5"
													bind:value={langData.short_description}
													id="short_description"
													name="short_description"
													class="w-full"
												/>
												{#if !langData.short_description.trim()}
													<p class="error-message mt-2">Please enter a short description</p>
												{/if}
											</Label>
										</div>
										
										<!-- Long Description Section -->
										<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg pb-12">
									 	<div class="mb-12">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Long Description</span>
												<div class="w-full" style="height: 400px;">
													<QuillEditor placeholder="Write details..." {langData} {isFormSubmitted} />
												</div>
											</Label>
										</div>
									</div>
								</div>
								</TabItem>
							{/each}
						</Tabs>
					</form>

					<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
						<!-- Submit Button -->
						<div class="flex justify-end my-6">
							<button
								on:click|preventDefault={formSubmit}
								type="submit"
								class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
							>
								<IconDeviceFloppy size={20} />
								Update About
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
								{#each aboutDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title=""
											short_description={langData.short_description}
											thumbnail={aboutData.image}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>
						</TabItem>
						<TabItem title="Detail">
							<div class="p-4">
								{#each aboutDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<DetailPage
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
