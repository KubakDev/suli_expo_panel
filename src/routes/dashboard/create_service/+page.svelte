<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertData } from '../../../stores/serviceStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ServiceModel, ServiceModelLang } from '../../../models/serviceModel';
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

	let serviceDataLang: ServiceModelLang[] = [];

	let serviceObject: ServiceModel = {
		id: 0,
		thumbnail: '',
		primaryColor: '#F5EFE7',
		onPrimaryColor: '#D8C4B6'
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		serviceDataLang.push({
			title: '',
			short_description: '',
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
			serviceObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `service/${randomText}`; // Append random text to the file name

			//
		};

		reader.readAsDataURL(file);
	}

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidServiceObject = false;

		for (let lang of serviceDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.short_description.trim();

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

		if (!isEmpty(serviceObject.thumbnail)) {
			isValidServiceObject = true;
		}
		if (!hasDataForLanguage || !isValidServiceObject) {
			isFormSubmitted = true;
			return;
		}
		submitted = true;
		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		serviceObject.thumbnail = response.data?.path || '';

		insertData(serviceObject, serviceDataLang, data.supabase);

		resetForm();
		goto('/dashboard/service');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		serviceObject = {
			id: 0,
			thumbnail: '',
			primaryColor: '#F5EFE7',
			onPrimaryColor: '#D8C4B6'
		};

		serviceDataLang = []; // Resetting serviceDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			serviceDataLang.push({
				title: '',
				short_description: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	function handleSelectChange(event: any) {
		const selectedValue = event.target.value;
		if (selectedValue === 'Select Type') {
			delete serviceObject.exhibition_id;
		} else {
			serviceObject.exhibition_id = selectedValue;
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
		<div class="flex justify-center py-10"><h1 class="text-2xl font-bold">Service Data</h1></div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Service Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !serviceObject.thumbnail.trim()}
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
						{#each serviceDataLang as langData}
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
										<Label for="title" class="mb-2">Service Title</Label>
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
					<div class="flex justify-between items-center w-full">
						<div class=" w-1/4">
							<TabItem open title="Service List">
								<div class="w-full rounded-md p-10 flex justify-center items-start">
									<div class="flex justify-start items-start">
										{#each serviceDataLang as langData}
											{#if langData.language === selectedLanguageTab}
												<ExpoCard
													cardType={CardType.Main}
													title={langData.title}
													short_description={langData.short_description}
													thumbnail={serviceObject.thumbnail}
													primaryColor={serviceObject.primaryColor}
													overlayPrimaryColor={serviceObject.onPrimaryColor}
												/>
											{/if}
										{/each}
									</div>

									<div />
								</div>
							</TabItem>
						</div>
						<!-- color picker -->
						<div class="w-3/4">
							<div class="flex justify-center items-center w-full">
								<input
									type="color"
									id="colorInput1"
									name="favcolor1"
									bind:value={serviceObject.primaryColor}
									class="w-full h-14 border-none"
								/>

								<input
									type="color"
									id="colorInput2"
									name="favcolor2"
									bind:value={serviceObject.onPrimaryColor}
									class="w-full h-14 border-none"
								/>
							</div>
						</div>
					</div>
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
