<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/carouselStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	import {
		CarouselTypeEnum,
		type CarouselModel,
		type CarouselModelLang
	} from '../../../../models/carouselModel';
	//@ts-ignore
	import { isEmpty } from 'validator';

	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let carouselDataLang: CarouselModelLang[] = [];
	let carouselData: CarouselModel = {
		id: 0,
		image: '',
		link: '',
		type: CarouselTypeEnum.Internal,
		created_at: new Date()
	};
	const id = $page.params.carouselId;

	//**** get data from db and put it into the fields ****//
	async function getCarouselData() {
		await data.supabase
			.from('carousel')
			.select('*,carousel_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				carouselData = {
					id: result.data?.id,
					type: result.data?.type,
					link: result.data?.link,
					image: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.image}`,
					created_at: new Date(result.data?.created_at)
				};

				//
				//
				prevThumbnail = result.data?.image;

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.carousel_languages.findIndex(
						(carouselLang: CarouselModelLang) =>
							carouselLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const carouselLang = result.data?.carousel_languages[index];
					carouselDataLang.push({
						title: carouselLang?.title ?? '',
						subtitle: carouselLang?.subtitle ?? '',
						language:
							carouselLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				carouselDataLang = [...carouselDataLang];
				carouselData = { ...carouselData };
			});
	}

	onMount(async () => {
		await getCarouselData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload thumbnail image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			carouselData.image = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `carousel/${randomText}`; // Append random text to the file name
			//
		};
		reader.readAsDataURL(file);
	} //**for upload image image**//

	//**Handle submit**//
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidVideoObject = false;

		for (let lang of carouselDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.subtitle.trim();

			const isTitleEmpty = isEmpty(title);
			const isShortDescriptionEmpty = isEmpty(shortDescription);

			if (!isTitleEmpty || !isShortDescriptionEmpty) {
				// At least one field is not empty
				hasDataForLanguage = true;
				if (isTitleEmpty || isShortDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(carouselData.image) && !isEmpty(carouselData.link)) {
			isValidVideoObject = true;
		}

		if (hasDataForLanguage && isValidVideoObject) {
			submitted = true;
			showToast = true;

			if (imageFile) {
				if (carouselData.image) {
					await data.supabase.storage.from('image').remove([carouselData.image]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				carouselData.image = response.data?.path || '';
			} else {
				carouselData.image = prevThumbnail;
			}

			updateData(carouselData, carouselDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/carousel');
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
			<h1 class="text-2xl font-bold">Update Carousel Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Video Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !carouselData.image.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="exhibition_type" class="block font-normal">Exhibition Type</label>
					<Select
						bind:value={carouselData.type}
						id="type"
						name="type"
						size="md"
						placeholder="Please select a valid type"
					>
						<option value="Internal">Internal</option>
						<option value="External">External</option>
					</Select>
				</Label>
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Enter a link</Label>
					<Input bind:value={carouselData.link} />
					{#if isFormSubmitted && !carouselData.link}
						<p class="error-message">Please Enter a link for video</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2">
				<form class="rounded-lg border dark:border-gray-600">
					<Tabs contentClass="dark:bg-gray-900">
						{#each carouselDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-10 py-10">
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
										<Label for="title" class="mb-2">Carousel Title</Label>
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
										<Label for="textarea-id" class="mb-2">Subtitle</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.subtitle}
											id="subtitle"
											name="subtitle"
										/>
										{#if !langData.subtitle.trim()}
											<p class="error-message">Please enter a subtitle</p>
										{/if}
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
				<Tabs style="underline" contentClass="dark:bg-gray-900 rounded-lg ">
					<TabItem open title="Carousel List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each carouselDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.subtitle}
											thumbnail={carouselData.image}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>

							<div />
						</div>
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
