<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Img } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/serviceStore';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ServiceModel, ServiceModelLang } from '../../../models/serviceModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';
	import { onMount } from 'svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';

	export let data;

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
		onPrimaryColor: '#D8C4B6',
		created_at: new Date()
	};

	let exhibitionData: ExhibitionModel[] = [];
	const fetchData = async () => {
		try {
			exhibitionData = await getDataExhibition(data.supabase);
		} catch (error) {
			console.error(error);
		}
	};

	onMount(fetchData);
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
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			serviceObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `service/${randomText}_${file.name}`; // Append random text to the file name

			// console.log('serviceObject////////////', serviceObject);
		};

		reader.readAsDataURL(file);
	}

	async function formSubmit() {
		submitted = true;
		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		serviceObject.thumbnail = response.data?.path;

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
			exhibition_type: '',
			created_at: new Date(),
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
		serviceObject.exhibition_id = event.target.value;
	}
</script>

<div style="min-height: calc(100vh - 160px);" class="grid grid-col-1 lg:grid-cols-3 bg-[#f1f3f4]">
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				successfully submitted
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">Service Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Service Image</Label>
						<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={serviceObject.created_at} format="yyyy/MM/dd" />
					</Label>
				</div>
				<div>
					<label class="space-y-2 mb-2">
						<label for="large-input" class="block">Exhibition Type</label>
						<select
							class="border border-gray-300 rounded-md"
							id="type"
							name="type"
							placeholder="Please select a valid type"
							on:change={handleSelectChange}
						>
							<option disabled selected>Select type</option>
							{#each exhibitionData as exhibition}
								<option value={exhibition.id}>{exhibition.exhibition_type}</option>
							{/each}
						</select>
					</label>
				</div>

				<br />

				<div class="col-span-3">
					<Tabs>
						{#each serviceDataLang as langData}
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
										<Label for="first_name" class="mb-2">Service Title</Label>
										<Input
											type="text"
											placeholder="Enter title"
											bind:value={langData.title}
											id="title"
											name="title"
										/>
										<!-- <Message name="title" /> -->
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
										<!-- <Message name="short_description" /> -->
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>

			<!-- button for submitForm -->
			<div class="w-full flex justify-end mt-2">
				<button
					on:click|preventDefault={formSubmit}
					type="submit"
					class="bg-primary-dark hover:bg-primary-50 text-white font-bold py-2 px-4 border border-primary-50 rounded"
				>
					Submit
				</button>
			</div>
		</Form>
	</div>
	<div class="h-full p-2 col-span-1 pt-20">
		<Tabs style="underline">
			<div class="flex justify-between items-center">
				<TabItem open title="Service List">
					<div
						class="w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
						style="min-height: calc(100vh - 300px);"
					>
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
				<!-- color picker -->
				<div class="flex justify-center items-center">
					<div class="flex px-4 -mb-2">
						<input
							type="color"
							id="colorInput1"
							name="favcolor1"
							bind:value={serviceObject.primaryColor}
							class="w-32 h-14 border-none"
						/>

						<input
							type="color"
							id="colorInput2"
							name="favcolor2"
							bind:value={serviceObject.onPrimaryColor}
							class="w-32 h-14 border-none"
						/>
					</div>
				</div>
			</div>
		</Tabs>
	</div>
</div>
