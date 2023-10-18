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
	import EditorComponent from '$lib/components/EditorComponent.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';

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

	let aboutDataLang: AboutModelLang[] = [];
	let aboutData: AboutModel = {
		id: 0,
		image: '',
		created_at: new Date()
	};
	const id = $page.params.aboutId;

	//**** get data from db and put it into the fields ****//
	async function getAboutData() {
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

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			The Update Was Successfully!
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10">
			<h1 class="text-2xl font-bold">Update About Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="image" class="mb-2">Upload About Image</Label>
					<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					{#if isFormSubmitted && !aboutData?.image?.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2">
				<form class="rounded-lg border dark:border-gray-600">
					<Tabs contentClass="dark:bg-gray-900">
						{#each aboutDataLang as langData}
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
										<Label for="first_name" class="mb-2">About Short description</Label>

										<Textarea
											placeholder="Enter short description"
											rows="5"
											bind:value={langData.short_description}
											id="short_description"
											name="short_description"
										/>
										{#if !langData.short_description.trim()}
											<p class="error-message">Please enter a short description</p>
										{/if}
									</div>

									<div class="pb-10">
										<Label for="textarea-id" class="">long description</Label>
										<div class="pt-4 w-full" style="height: 400px;">
											<EditorComponent {langData} {isFormSubmitted} />
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
					<div class="border mb-2 dark:border-gray-700 mx-10" />

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
					<TabItem open title="About List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each aboutDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType?.Main}
											title=""
											short_description={langData.short_description}
											thumbnail={aboutData.image}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
					</TabItem>
					<TabItem title="About Detail">
						{#each aboutDataLang as langData}
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
