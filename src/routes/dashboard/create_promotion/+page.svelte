<script lang="ts">
	import { Label, Input, Fileupload, InputAddon, ButtonGroup } from 'flowbite-svelte';

	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/promoStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { PromoModel, PromoModelLang } from '../../../models/promoModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';

	export let data;
	let isFormSubmitted = false;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let promoDataLang: PromoModelLang[] = [];

	let promoObject: PromoModel = {
		id: 0,
		thumbnail: ''
	};

	function handleSelectChange(event: any) {
		const selectedValue = event.target.value;
		if (selectedValue === 'Select Type') {
			delete promoObject.exhibition_id;
		} else {
			promoObject.exhibition_id = selectedValue;
		}
	}

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		promoDataLang.push({
			title: '',
			video_link: '',
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
			promoObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `promotions/${randomText}`; // Append random text to the file name
		};

		reader.readAsDataURL(file);
	}

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidPromoObject = false;
		// Insert data into Supabase

		for (let lang of promoDataLang) {
			const title = lang.title.trim();
			const link = lang.video_link.trim();

			const isTitleEmpty = isEmpty(title);
			const isLinkEmpty = isEmpty(link);

			if (!isTitleEmpty || !isLinkEmpty) {
				// All fields are non-empty for this language
				hasDataForLanguage = true;
				if (isTitleEmpty || isLinkEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		// Check if galleryObject has a valid thumbnail and at least one slider image
		if (!isEmpty(promoObject.thumbnail)) {
			isValidPromoObject = true;
		}

		if (!hasDataForLanguage || !isValidPromoObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		// Upload promo thumbnail image
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		promoObject.thumbnail = response.data?.path || '';

		insertData(promoObject, promoDataLang, data.supabase);

		resetForm();
		goto('/dashboard/promotions');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		promoObject = {
			id: 0,
			thumbnail: ''
		};

		promoDataLang = []; // Resetting promoDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			promoDataLang.push({
				title: '',
				video_link: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}
</script>

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">Promotion Data</h1></div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Promotion Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !promoObject.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>

			<div class="col-span-1">
				<InsertExhibitionType {handleSelectChange} {data} />
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2">
				<form class="rounded-lg border dark:border-gray-600">
					<Tabs contentClass="dark:bg-gray-900">
						{#each promoDataLang as langData}
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
									<div class="pb-10 px-5">
										<Label for="title" class="mb-2">Promo Title</Label>
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

									<div class="px-5">
										<Label for="video_link" class="mb-2">Promo video_link</Label>
										<Input
											type="text"
											placeholder="Enter video_link"
											bind:value={langData.video_link}
											id="video_link"
											name="video_link"
										/>
										{#if isFormSubmitted && !langData.video_link.trim()}
											<p class="error-message">Please enter a video link</p>
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
			<div class="lg:col-span-1 border rounded-lg dark:border-gray-600">
				<Tabs style="underline" contentClass="dark:bg-gray-900 rounded-lg">
					<TabItem open title="Promotion List">
						<div class=" w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each promoDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Video}
											title={langData.title}
											short_description=""
											thumbnail={promoObject.thumbnail}
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
