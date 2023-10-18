<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateSeatService } from '../../../../stores/seatServicesStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import {
		SeatServiceTypeEnum,
		type seatServicesModel,
		type seatServicesModelLang
	} from '../../../../models/seatServicesModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	//@ts-ignore
	import { isEmpty } from 'validator';

	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let seatServicesDataLang: seatServicesModelLang[] = [];
	let seatServicesData: seatServicesModel = {
		id: 0,
		icon: '',
		quantity: 0,
		discount: 0,
		price: 0,
		type: SeatServiceTypeEnum.SINGULAR,
		created_at: new Date()
	};
	const id = $page.params.seatServicesId;

	//**** get data from db and put it into the fields ****//
	async function getSeatServicesData() {
		await data.supabase
			.from('seat_services')
			.select('*,seat_services_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				seatServicesData = {
					id: result.data?.id,
					icon: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.icon}`,
					created_at: new Date(result.data?.created_at),
					price: result.data?.price,
					quantity: result.data?.quantity,
					discount: result.data?.discount,
					type: result.data?.type
				};

				prevThumbnail = result.data?.icon;

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.seat_services_languages.findIndex(
						(seatServicesLang: seatServicesModelLang) =>
							seatServicesLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const seatServicesLang = result.data?.seat_services_languages[index];
					seatServicesDataLang.push({
						title: seatServicesLang?.title ?? '',
						description: seatServicesLang?.description ?? '',
						language:
							seatServicesLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				seatServicesDataLang = [...seatServicesDataLang];
				seatServicesData = { ...seatServicesData };
			});
	}

	onMount(async () => {
		await getSeatServicesData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload icon image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		//
		const reader = new FileReader();

		reader.onloadend = () => {
			seatServicesData.icon = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `seat_services/${randomText}`; // Append random text to the file name
			//
		};
		reader.readAsDataURL(file);
	} //**for upload icon image**//

	//**Handle submit**//
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidSeatServiceObject = false;

		for (let lang of seatServicesDataLang) {
			const title = lang.title.trim();
			const shortDescription = lang.description.trim();

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

		if (!isEmpty(seatServicesData.icon) && seatServicesData.quantity > 0) {
			isValidSeatServiceObject = true;
		}

		if (hasDataForLanguage && isValidSeatServiceObject) {
			submitted = true;
			showToast = true;

			if (imageFile) {
				if (seatServicesData.icon) {
					await data.supabase.storage.from('image').remove([seatServicesData.icon]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);

				if (response.data) {
					seatServicesData.icon = response.data.path;
				}
			} else {
				seatServicesData.icon = prevThumbnail;
			}

			updateSeatService(seatServicesData, seatServicesDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/seatServices');
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
			<h1 class="text-2xl font-bold">Update Seat Service Data</h1>
		</div>

		<div class="grid lg:grid-cols-4 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Seat Service Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !seatServicesData.icon.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<label for="type" class="block font-normal">Type</label>
					<Select
						bind:value={seatServicesData.type}
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

			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Discount</Label>
					<Input
						type="number"
						bind:value={seatServicesData.discount}
						placeholder="Enter a number"
						min="0"
					/>
				</Label>
			</div>

			<!-- <div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Enter price</Label>
					<Input type="number" bind:value={seatServicesData.price} placeholder="Enter a number" />
					<p class="text-xs text-gray-500">
						Note: <span class="text-gray-400">If it is free, it does not require a price.</span>
					</p>
				</Label>
			</div> -->
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="icon" class="mb-2">Quantity</Label>
					<Input
						type="number"
						bind:value={seatServicesData.quantity}
						placeholder="Enter a number"
						min="0"
					/>
					{#if isFormSubmitted && !seatServicesData.quantity}
						<p class="error-message">Please Enter quantity number</p>
					{/if}
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
										<Label for="first_name" class="mb-2">Seat Service Title</Label>

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
										<Label for="textarea-id" class="mb-2">Short description</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.description}
											id="short_description"
											name="short_description"
										/>
										{#if !langData.description.trim()}
											<p class="error-message">Please enter a description</p>
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
					<TabItem open title="Seat_services List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each seatServicesDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.description}
											thumbnail={seatServicesData.icon}
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
