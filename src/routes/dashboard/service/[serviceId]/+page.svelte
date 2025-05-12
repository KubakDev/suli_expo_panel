<script lang="ts">
	import { Label, Input, Fileupload, Textarea, ButtonGroup, InputAddon } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/serviceStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { ServiceModel, ServiceModelLang } from '../../../../models/serviceModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconX, IconDeviceFloppy } from '@tabler/icons-svelte';
	
	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;
	let loaded = false;
	let serviceDataLang: ServiceModelLang[] = [];
	let serviceData: ServiceModel = {
		id: 0,
		thumbnail: '',
		primaryColor: '',
		onPrimaryColor: ''
	};
	const id = $page.params.serviceId;

	//**** get data from db and put it into the fields ****//
	async function getServiceData() {
		loaded = false;
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
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.thumbnail}`
				};

				prevThumbnail = result.data?.thumbnail;
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
			loaded = true;
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
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			serviceData.thumbnail = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `service/${randomText}`; // Append random text to the file name
			//
		};
		reader.readAsDataURL(file);
	} //**for upload thumbnail image**//

	//**Handle submit**//
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidServiceObject = false;

		for (let lang of serviceDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.short_description.trim();

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

		if (!isEmpty(serviceData.thumbnail)) {
			isValidServiceObject = true;
		}

		if (hasDataForLanguage && isValidServiceObject) {
			submitted = true;
			showToast = true;

			if (imageFile) {
				if (serviceData.thumbnail) {
					await data.supabase.storage.from('image').remove([serviceData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				serviceData.thumbnail = response.data?.path || '';
			} else {
				serviceData.thumbnail = prevThumbnail;
			}

			updateData(serviceData, serviceDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/service');
			}, 1000);
		} else {
			isFormSubmitted = true;
			return;
		}
	}

	function handleSelectChange(event: Event) {
		const selectedValue = (event.target as HTMLSelectElement).value;
		
		if (selectedValue === 'Select Type') {
			delete serviceData.exhibition_id;
		} else {
			serviceData.exhibition_id = parseInt(selectedValue, 10);
		}
	}
</script>
{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="min-h-screen bg-gray-50 dark:bg-[#222831]">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Service updated successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update Service</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Edit service details and media</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[#2c333d] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-800">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Service Image</span>
						<div class="relative">
							{#if serviceData.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											serviceData.thumbnail = '';
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
								class="dark:bg-[#323a45] dark:border-gray-700 dark:text-gray-300"
							/>
						</div>
						{#if isFormSubmitted && !serviceData.thumbnail.trim()}
							<p class="error-message mt-2">Please upload an image</p>
						{/if}
					</Label>
				</div>
			</div>
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[#2c333d] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-800">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<UpdateExhibitionType {handleSelectChange} pageData={serviceData} {data} />
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-[#2c333d] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-[#2c333d]" style="pill" class="p-4">
							{#each serviceDataLang as langData}
								<TabItem
									open={langData.language == selectedLanguageTab}
									title={langData.language}
									on:click={() => {
										selectedLanguageTab = langData.language;
									}}
								>
									<div class="p-6 text-gray-700 dark:text-gray-300">
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

										<!-- Title Section -->
										<div class="bg-gray-50 dark:bg-[#222831] p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Service Title</span>
												<Input
													type="text"
													placeholder="Enter title"
													bind:value={langData.title}
													id="title"
													name="title"
													class="w-full"
												/>
												{#if !langData.title.trim()}
													<p class="error-message mt-2">Please enter a title</p>
												{/if}
											</Label>
										</div>
										
										<!-- Short Description -->
										<div class="bg-gray-50 dark:bg-[#222831] p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Short Description</span>
												<Textarea
													placeholder="Enter short description"
													rows="4"
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
								Update Service
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-[#2c333d] rounded-lg shadow-sm p-0 border border-gray-200 dark:border-gray-800 overflow-hidden h-full">
					<Tabs style="pill" contentClass="dark:text-white p-4" class="px-4 pt-4">
						<TabItem open title="Preview">
							<div class="rounded-md flex justify-center items-start p-4">
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
						</TabItem>
						<TabItem title="Colors">
							<div class="p-4">
								<p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Adjust the colors for the service card</p>
								<div class="grid grid-cols-2 gap-3">
									<div>
										<Label class="block mb-2 text-xs">Primary Color</Label>
										<input
											type="color"
											id="colorInput1"
											name="favcolor1"
											bind:value={serviceData.primaryColor}
											class="w-full h-10 rounded-md cursor-pointer"
										/>
									</div>
									<div>
										<Label class="block mb-2 text-xs">Overlay Color</Label>
										<input
											type="color"
											id="colorInput2"
											name="favcolor2"
											bind:value={serviceData.onPrimaryColor}
											class="w-full h-10 rounded-md cursor-pointer"
										/>
									</div>
								</div>
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
