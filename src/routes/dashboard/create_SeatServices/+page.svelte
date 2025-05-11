<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Img, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { insertDataToSeatService } from '../../../stores/seatServicesStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import {
		SeatServiceTypeEnum,
		type seatServicesModel,
		type seatServicesModelLang
	} from '../../../models/seatServicesModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import { IconX, IconDeviceFloppy } from '@tabler/icons-svelte';
	
	const placeholderImage = '/src/lib/images/placeholder.png';
	
	export let data;
	let isFormSubmitted = false;
	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let seatServicesDataLang: seatServicesModelLang[] = [];

	let seatServicesObject: seatServicesModel = {
		id: 0,
		icon: '',
		quantity: 0,
		discount: 0,
		price: 0,
		type: SeatServiceTypeEnum.SINGULAR,
		created_at: new Date()
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		seatServicesDataLang.push({
			title: '',
			description: '',
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		const reader = new FileReader();

		reader.onloadend = () => {
			seatServicesObject.icon = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `seat_services/${randomText}`;
		};

		reader.readAsDataURL(file);
	}

	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidServiceObject = false;

		for (let lang of seatServicesDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.description.trim();

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

		if (!isEmpty(seatServicesObject.icon)) {
			isValidServiceObject = true;
		}

		if (!hasDataForLanguage || !isValidServiceObject) {
			isFormSubmitted = true;
			return;
		}

		submitted = true;
		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);

		//
		seatServicesObject.icon = response.data?.path ?? '';

		insertDataToSeatService(seatServicesObject, seatServicesDataLang, data.supabase);

		resetForm();
		goto('/dashboard/seatServices');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		seatServicesObject = {
			icon: '',
			price: 0,
			quantity: 0,
			discount: 0,
			type: SeatServiceTypeEnum.SINGULAR,
			created_at: new Date(),
			id: 0
		};

		seatServicesDataLang = []; // Resetting seatServicesDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			seatServicesDataLang.push({
				title: '',
				description: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Seat service has been created successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Create Seat Service</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Enter seat service details and upload media</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Service Icon</span>
						<div class="relative">
							{#if seatServicesObject.icon}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											seatServicesObject.icon = '';
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
						{#if isFormSubmitted && !seatServicesObject?.icon?.trim()}
							<p class="error-message mt-2">Please upload an image</p>
						{/if}
					</Label>
					
					<Label class="block mt-6">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Service Type</span>
						<Select
							bind:value={seatServicesObject.type}
							id="type"
							name="type"
							class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							disabled="true"
						>
							<option value={SeatServiceTypeEnum.SINGULAR}>{SeatServiceTypeEnum.SINGULAR}</option>
							<option value={SeatServiceTypeEnum.PLURAL}>{SeatServiceTypeEnum.PLURAL}</option>
						</Select>
					</Label>
				</div>
			</div>
			
			<div class="lg:col-span-8">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 h-full">
					<div class="grid grid-cols-3 gap-4">
						<div>
							<Label class="block">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Price</span>
								<Input
									type="number"
									bind:value={seatServicesObject.price}
									placeholder="Enter price"
									min="0"
									class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								/>
							</Label>
						</div>
						
						<div>
							<Label class="block">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Quantity</span>
								<Input
									type="number"
									bind:value={seatServicesObject.quantity}
									placeholder="Enter quantity"
									min="0"
									class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								/>
								{#if isFormSubmitted && !seatServicesObject.quantity}
									<p class="error-message mt-2">Please enter quantity</p>
								{/if}
							</Label>
						</div>
						
						<div>
							<Label class="block">
								<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Discount</span>
								<Input
									type="number"
									bind:value={seatServicesObject.discount}
									placeholder="Enter discount"
									min="0"
									class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								/>
							</Label>
						</div>
					</div>
					
					<div class="mt-4 text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-2">
						<p>• If quantity is 0, the service will not be displayed</p>
						<p>• If the service is free, leave price at 0</p>
					</div>
				</div>
			</div>
		</div>
		
		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
							{#each seatServicesDataLang as langData}
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

										<!-- Title Section -->
										<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
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
												{#if isFormSubmitted && !langData.title.trim()}
													<p class="error-message mt-2">Please enter a title</p>
												{/if}
											</Label>
										</div>
										
										<!-- Description -->
										<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Description</span>
												<Textarea
													placeholder="Enter description"
													rows="4"
													bind:value={langData.description}
													id="description"
													name="description"
													class="w-full"
												/>
												{#if isFormSubmitted && !langData.description.trim()}
													<p class="error-message mt-2">Please enter a description</p>
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
								Create Seat Service
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
								{#each seatServicesDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.description}
											thumbnail={seatServicesObject.icon || placeholderImage}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>
							
							{#if (seatServicesObject.price !== undefined && seatServicesObject.price > 0) || (seatServicesObject.quantity !== undefined && seatServicesObject.quantity > 0)}
								<div class="p-4 mt-2">
									<div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
										<div class="grid grid-cols-2 gap-4">
											{#if seatServicesObject.price !== undefined && seatServicesObject.price > 0}
												<div>
													<p class="text-sm text-gray-500 dark:text-gray-400">Price:</p>
													<p class="font-medium text-gray-700 dark:text-gray-300">{seatServicesObject.price}</p>
												</div>
											{/if}
											
											{#if seatServicesObject.quantity !== undefined && seatServicesObject.quantity > 0}
												<div>
													<p class="text-sm text-gray-500 dark:text-gray-400">Quantity:</p>
													<p class="font-medium text-gray-700 dark:text-gray-300">{seatServicesObject.quantity}</p>
												</div>
											{/if}
											
											{#if seatServicesObject.discount !== undefined && seatServicesObject.discount > 0}
												<div>
													<p class="text-sm text-gray-500 dark:text-gray-400">Discount:</p>
													<p class="font-medium text-gray-700 dark:text-gray-300">{seatServicesObject.discount}</p>
												</div>
											{/if}
											
											<div>
												<p class="text-sm text-gray-500 dark:text-gray-400">Type:</p>
												<p class="font-medium text-gray-700 dark:text-gray-300">{seatServicesObject.type}</p>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</TabItem>
					</Tabs>
				</div>
			</div>
		</div>
	</div>
</div>

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
