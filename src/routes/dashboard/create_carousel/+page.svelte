<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Select, Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/carouselStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import {
		CarouselTypeEnum,
		type CarouselModel,
		type CarouselModelLang
	} from '../../../models/carouselModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	//@ts-ignore
	import { isEmpty } from 'validator';

	export let data;
	let isFormSubmitted = false;
	let fileName: string;
	let imageFile: File | undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let carouselDataLang: CarouselModelLang[] = [];
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);
	//

	const languageEnumLength = languageEnumKeys.length;

	for (let i = 0; i < languageEnumLength; i++) {
		carouselDataLang.push({
			title: '',
			subtitle: '',
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	let carouselObject: CarouselModel = {
		image: '',
		link: '',
		type: CarouselTypeEnum.Internal
	};

	// for upload img
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			carouselObject.image = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `carousel/${randomText}`; // Append random text to the file name
		};

		reader.readAsDataURL(file);
	}

	let submitted = false;
	let showToast = false;

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidCarouselObject = false;

		for (let lang of carouselDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.subtitle.trim();

			const isTitleEmpty = isEmpty(title);
			const isShortDescriptionEmpty = isEmpty(shortDescription);

			if (!isTitleEmpty || !isShortDescriptionEmpty) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (isTitleEmpty || isShortDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(carouselObject.image) && !isEmpty(carouselObject.link)) {
			isValidCarouselObject = true;
		}

		if (!hasDataForLanguage || !isValidCarouselObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);

		carouselObject.image = response.data?.path || '';
		insertData(carouselObject, carouselDataLang, data.supabase);

		resetForm();
		goto('/dashboard/carousel');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	//  create reset form
	function resetForm() {
		submitted = false;

		carouselObject = {
			link: '',
			type: CarouselTypeEnum.Internal,
			image: ''
		};

		carouselDataLang = []; // Resetting carouselDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			carouselDataLang.push({
				title: '',
				subtitle: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}
</script>

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">Carousel Data</h1></div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Carousel Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !carouselObject.image.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="exhibition_type" class="block font-normal">Type</label>
					<Select
						bind:value={carouselObject.type}
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
					<Label for="large-input" class="block mb-2">Link</Label>
					<Input
						bind:value={carouselObject.link}
						id="link"
						name="link"
						size="md"
						placeholder="please, enter a valid link"
					/>
					{#if isFormSubmitted && !carouselObject.link}
						<p class="error-message">Please Enter a link</p>
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
									<div class="pb-10 px-4">
										<Label for="title" class="mb-2">Carousel Title</Label>
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
									<div class="pb-10 px-4">
										<Label for="textarea-id" class="mb-2">Subtitle</Label>
										<Textarea
											placeholder="Enter Subtitle"
											rows="4"
											bind:value={langData.subtitle}
											id="subtitle"
											name="subtitle"
										/>
										{#if isFormSubmitted && !langData.subtitle.trim()}
											<p class="error-message">Please enter a subtitle</p>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>

					<div class="border mb-2 dark:border-gray-700 mx-10" />

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
			<div class="lg:col-span-1 border rounded-lg">
				<Tabs style="underline" class="bg-secondary rounded-tl rounded-tr">
					<TabItem open title="Carousel List">
						<div class=" w-full rounded-md p-10 flex justify-center items-start">
							<div class="flex justify-start items-start">
								{#each carouselDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.subtitle}
											thumbnail={carouselObject.image}
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
