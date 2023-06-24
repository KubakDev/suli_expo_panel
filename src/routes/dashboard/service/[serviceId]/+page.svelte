<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { updateData } from '../../../../stores/serviceStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { ServiceModel, ServiceModelLang } from '../../../../models/serviceModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { ImagesModel } from '../../../../models/imagesModel';
	import { goto } from '$app/navigation';
	import type { ExhibitionModel } from '../../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../../stores/exhibitionTypeStore';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';

	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	let submitted = false;
	let showToast = false;

	let serviceDataLang: ServiceModelLang[] = [];
	let serviceData: ServiceModel = {
		id: 0,
		thumbnail: '',
		exhibition_type: '',
		primaryColor: '',
		onPrimaryColor: '',
		created_at: new Date()
	};
	const id = $page.params.serviceId;
	let images: ImagesModel[] = [];

	let exhibitionData: ExhibitionModel[] = [];
	const fetchData = async () => {
		try {
			exhibitionData = await getDataExhibition(data.supabase);
			// console.log('exhibitionData//////', exhibitionData);
		} catch (error) {
			console.error(error);
		}
	};

	onMount(fetchData);

	//**** get data from db and put it into the fields ****//
	async function getServiceData() {
		await data.supabase
			.from('service')
			.select('*,service_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				serviceData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					primaryColor: result.data?.primaryColor,
					onPrimaryColor: result.data?.onPrimaryColor,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
						result.data?.thumbnail
					}`,
					created_at: new Date(result.data?.created_at)
				};

				// console.log('service data get db thumbnail : ////////', serviceData.thumbnail);
				// console.log('service data get db images: ////////', serviceData.images);

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.service_languages.findIndex(
						(serviceLang: ServiceModelLang) =>
							serviceLang.language == LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const serviceLang = result.data?.service_languages[index];
					serviceDataLang.push({
						title: serviceLang?.title ?? '',
						short_description: serviceLang?.short_description ?? '',
						language:
							serviceLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				serviceDataLang = [...serviceDataLang];
				serviceData = { ...serviceData };
			});
	}

	onMount(async () => {
		await getServiceData();
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
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			serviceData.thumbnail = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `service/${randomText}_${file.name}`; // Append random text to the file name
			// console.log(serviceData);
		};
		reader.readAsDataURL(file);
	} //**for upload thumbnail image**//

	//**Handle submit**//
	async function formSubmit() {
		submitted = true;
		showToast = true;

		if (imageFile) {
			if (serviceData.thumbnail) {
				await data.supabase.storage.from('image').remove([serviceData.thumbnail]);
			}

			const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
			serviceData.thumbnail = response.data?.path;
		}

		updateData(serviceData, serviceDataLang, data.supabase);

		setTimeout(() => {
			showToast = false;
		}, 1000);
		goto('/dashboard/service');
	}

	function handleSelectChange(event: any) {
		serviceData.exhibition_id = event.target.value;
		// console.log(event.target.value);
	}
</script>

<div style="min-height: calc(100vh - 160px);" class="grid grid-col-1 lg:grid-cols-3 bg-[#f1f3f4]">
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				The Update Was Successfully!
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">Service Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Service Image</Label>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={serviceData.created_at} />
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
							<option disabled selected>
								{serviceData.exhibition_id
									? exhibitionData.find((item) => item.id == serviceData.exhibition_id)
											?.exhibition_type
									: 'Select type'}
							</option>
							{#each exhibitionData as exhibition}
								<option value={exhibition.id}>{exhibition.exhibition_type}</option>
							{/each}
						</select>
					</label>
				</div>
				<br />

				<div class="col-span-3">
					<Tabs
						activeClasses="p-4 text-primary-500 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500"
					>
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
					class="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 border border-blue-700 rounded"
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
						class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
						style="min-height: calc(100vh - 300px);"
					>
						<div class="flex justify-start items-start">
							{#each serviceDataLang as langData}
								{#if langData.language === selectedLanguageTab}
									<ExpoCard
										cardType={CardType.Main}
										title={langData.title}
										short_description={langData.short_description}
										thumbnail={serviceData.thumbnail}
										primaryColor={serviceData.primaryColor}
										overlayPrimaryColor={serviceData.onPrimaryColor}
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
							bind:value={serviceData.primaryColor}
							class="w-32 h-14 border-none"
						/>

						<input
							type="color"
							id="colorInput2"
							name="favcolor2"
							bind:value={serviceData.onPrimaryColor}
							class="w-32 h-14 border-none"
						/>
					</div>
				</div>
			</div>
		</Tabs>
	</div>
</div>
