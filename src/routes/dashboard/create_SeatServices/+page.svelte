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

<div style="min-height: calc(100vh - 160px);">
	{#if showToast}
		<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			New data has been inserted successfully
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="flex justify-center py-10">
			<h1 class="text-2xl font-bold">SeatServices Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Upload SeatServices Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !seatServicesObject?.icon?.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Quantity</Label>
					<Input
						type="number"
						bind:value={seatServicesObject.quantity}
						placeholder="Enter a number"
						min="0"
					/>
					{#if isFormSubmitted && !seatServicesObject.quantity}
						<p class="error-message">Please Enter quantity number</p>
					{/if}
				</Label>
			</div>
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="type" class="block font-normal">Type</label>
					<Select
						bind:value={seatServicesObject.type}
						id="type"
						name="type"
						size="md"
						placeholder="Please select a valid type"
					>
						<option value={SeatServiceTypeEnum.SINGULAR}>{SeatServiceTypeEnum.SINGULAR}</option>
						<option value={SeatServiceTypeEnum.PLURAL}>{SeatServiceTypeEnum.PLURAL}</option>
					</Select>
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Price</Label>
					<Input
						type="number"
						bind:value={seatServicesObject.price}
						placeholder="Enter a number"
						min="0"
					/>
					<p class="text-xs text-gray-500">
						Note: <span class="text-gray-400">If it is free, it does not require a price.</span>
					</p>
				</Label>
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Discount</Label>
					<Input
						type="number"
						bind:value={seatServicesObject.discount}
						placeholder="Enter a number"
						min="0"
					/>
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2">
				<form class="rounded-lg border dark:border-gray-600">
					<Tabs contentClass="dark:bg-gray-900">
						{#each seatServicesDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-5 py-16">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl font-bold">
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
										<Label for="title" class="mb-2">Seat Service Title</Label>
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
											bind:value={langData.description}
											id="description"
											name="description"
										/>
										{#if isFormSubmitted && !langData.description.trim()}
											<p class="error-message">Please enter a description</p>
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
					<TabItem open title="Seat_services List">
						<div class=" w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each seatServicesDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.description}
											thumbnail={seatServicesObject.icon}
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
