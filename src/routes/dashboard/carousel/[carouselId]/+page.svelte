<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { updateData } from '../../../../stores/carouselStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	import {
		CarouselTypeEnum,
		type CarouselModel,
		type CarouselModelLang
	} from '../../../../models/carouselModel';

	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	let submitted = false;
	let showToast = false;
	let prevThumbnail: string = '';

	let carouselDataLang: CarouselModelLang[] = [];
	let carouselData: CarouselModel = {
		id: 0,
		image: '',
		link: '',
		type: CarouselTypeEnum.Internal,
		created_at: new Date()
	};
	const id = $page.params.carouselId;

	//**** get data from db and put it into the fields ****//
	async function getCarouselData() {
		await data.supabase
			.from('carousel')
			.select('*,carousel_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				carouselData = {
					id: result.data?.id,
					type: result.data?.type,
					link: result.data?.link,
					image: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.image}`,
					created_at: new Date(result.data?.created_at)
				};

				// console.log('carousel data get db thumbnail : ////////', carouselData.thumbnail);
				// console.log('carousel data get db images: ////////', carouselData.images);
				prevThumbnail = result.data?.thumbnail;

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.carousel_languages.findIndex(
						(carouselLang: CarouselModelLang) =>
							carouselLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const carouselLang = result.data?.carousel_languages[index];
					carouselDataLang.push({
						title: carouselLang?.title ?? '',
						subtitle: carouselLang?.subtitle ?? '',
						language:
							carouselLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				carouselDataLang = [...carouselDataLang];
				carouselData = { ...carouselData };
			});
	}

	onMount(async () => {
		await getCarouselData();
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
			carouselData.image = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `carousel/${randomText}_${file.name}`; // Append random text to the file name
			// console.log(carouselData);
		};
		reader.readAsDataURL(file);
	} //**for upload image image**//

	//**Handle submit**//
	async function formSubmit() {
		submitted = true;
		showToast = true;

		if (imageFile) {
			if (carouselData.image) {
				await data.supabase.storage.from('image').remove([carouselData.image]);
			}

			const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
			carouselData.image = response.data?.path;
		} else {
			carouselData.image = prevThumbnail;
		}

		updateData(carouselData, carouselDataLang, data.supabase);

		setTimeout(() => {
			showToast = false;
		}, 1000);
		goto('/dashboard/carousel');
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
			<h1 class="text-xl font-bold mb-8">Carousel Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Carousel Image</Label>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>

				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Enter a link</Label>
						<Input bind:value={carouselData.link} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<div class="mb-6">
							<Label for="large-input" class="block mb-2">Type</Label>
							<Select
								bind:value={carouselData.type}
								id="type"
								name="type"
								size="md"
								placeholder="Please select a valid type"
							>
								<option value="Internal">Internal</option>
								<option value="External">External</option>
							</Select>

							<!-- <Message name="type" /> -->
						</div>
					</Label>
				</div>
				<br />

				<div class="col-span-3">
					<Tabs
						activeClasses="p-4 text-primary-500 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500"
					>
						{#each carouselDataLang as langData}
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
										<Label for="first_name" class="mb-2">Carousel Title</Label>
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
										<Label for="textarea-id" class="mb-2">Subtitle</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.subtitle}
											id="subtitle"
											name="subtitle"
										/>
										<!-- <Message name="subtitle" /> -->
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
			<TabItem open title="Carousel List">
				<div
					class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
					style="min-height: calc(100vh - 300px);"
				>
					<div class="flex justify-start items-start">
						{#each carouselDataLang as langData}
							{#if langData.language === selectedLanguageTab}
								<ExpoCard
									cardType={CardType.Main}
									title={langData.title}
									short_description={langData.subtitle}
									thumbnail={carouselData.image}
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
