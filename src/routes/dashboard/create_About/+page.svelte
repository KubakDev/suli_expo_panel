<script lang="ts">
	import { Label, Fileupload, Textarea, Img } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/aboutStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { AboutModel, AboutModelLang } from '../../../models/aboutModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import Editor from '@tinymce/tinymce-svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';

	export let data;
	let isFormSubmitted = false;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let aboutDataLang: AboutModelLang[] = [];

	let aboutObject: AboutModel = {
		image: '',
		created_at: new Date(),
		id: 0
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		aboutDataLang.push({
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
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			aboutObject.image = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `about/${randomText}`; // Append random text to the file name

			//
		};

		reader.readAsDataURL(file);
	}

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidAboutObject = false;

		for (let lang of aboutDataLang) {
			const short_description = lang.short_description.trim();
			const longDescription = lang.long_description.trim();

			const isShortDescriptionEmpty = isEmpty(short_description);
			const isLongDescriptionEmpty = isEmpty(longDescription);

			if (!isShortDescriptionEmpty || !isLongDescriptionEmpty) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (isShortDescriptionEmpty || isLongDescriptionEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(aboutObject.image)) {
			isValidAboutObject = true;
		}

		if (!hasDataForLanguage || !isValidAboutObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);

		//
		aboutObject.image = response.data?.path || '';

		insertData(aboutObject, aboutDataLang, data.supabase);

		resetForm();
		goto('/dashboard/about');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		aboutObject = {
			image: '',
			created_at: new Date(),
			id: 0
		};

		aboutDataLang = []; // Resetting aboutDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			aboutDataLang.push({
				short_description: '',
				long_description: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	const conf = {
		toolbar:
			'undo redo | a11ycheck casechange blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | ' +
			'bullist numlist checklist outdent indent | removeformat | code table help',
		plugins: [
			'a11ychecker',
			'advlist',
			'advcode',
			'advtable',
			'autolink',
			'checklist',
			'export',
			'lists',
			'link',
			'image',
			'charmap',
			'preview',
			'anchor',
			'searchreplace',
			'visualblocks',
			'powerpaste',
			'fullscreen',
			'formatpainter',
			'insertdatetime',
			'media',
			'table',
			'help',
			'wordcount'
		],
		height: 500
	};
</script>

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10">
			<h1 class="text-2xl font-bold">About Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Upload About Image</Label>
					<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					{#if isFormSubmitted && !aboutObject.image.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2 rounded-lg border dark:border-gray-600">
				<form>
					<Tabs contentClass="dark:bg-gray-900">
						{#each aboutDataLang as langData}
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
										<Label for="short_description" class="mb-2">Description</Label>
										<Textarea
											placeholder="Enter short description"
											rows="5"
											bind:value={langData.short_description}
											id="short_description"
											name="short_description"
										/>
										{#if isFormSubmitted && !langData.short_description.trim()}
											<p class="error-message">Please enter a short_description</p>
										{/if}
									</div>

									<div class="pb-0">
										<Label for="textarea-id" class="mb-2">About Paragraph</Label>
										<div class="pt-4 w-full" style="height: 400px;">
											<Editor
												apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
												channel="5-dev"
												text="readonly-text-output"
												bind:value={langData.long_description}
												{conf}
											/>
											{#if isFormSubmitted && !langData.long_description.trim()}
												<p class="error-message">Please enter a long description</p>
											{/if}
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
					<TabItem open title="Gallery List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each aboutDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title=""
											short_description={langData.short_description}
											thumbnail={aboutObject.image}
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
