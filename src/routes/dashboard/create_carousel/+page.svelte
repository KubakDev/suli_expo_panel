<script lang="ts">
	import {
		Label,
		Button,
		Input,
		Fileupload,
		Textarea,
		Select,
		Tabs,
		TabItem
	} from 'flowbite-svelte';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/carouselStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import {
		CarouselTypeEnum,
		type CarouselModel,
		type CarouselModelLang
	} from '../../../models/carouselModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';

	export let data;

	let fileName: string;
	let imageFile: File | undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let carouselDataLang: CarouselModelLang[] = [];
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);
	// console.log(languageEnumKeys);

	const languageEnumLength = languageEnumKeys.length;

	for (let i = 0; i < languageEnumLength; i++) {
		carouselDataLang.push({
			title: '',
			subtitle: '',
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	let carouselObject: CarouselModel = {
		image: '',
		link: '',
		type: CarouselTypeEnum.Internal
	};

	// for upload img
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			carouselObject.image = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `carousel/${randomText}_${file.name}`; // Append random text to the file name

			console.log(carouselObject);
		};

		reader.readAsDataURL(file);
	}

	let submitted = false;
	let showToast = false;

	async function formSubmit() {
		submitted = true;
		showToast = true;
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);
		console.log(response);
		carouselObject.image = response.data?.path;
		insertData(carouselObject, carouselDataLang, data.supabase);
		resetForm();
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		carouselObject = {
			link: '',
			type: CarouselTypeEnum.Internal,
			image: ''
		};

		carouselDataLang = []; // Resetting carouselDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			carouselDataLang.push({
				title: '',
				subtitle: '',
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}
</script>

<div
	style="min-height: calc(100vh - 160px);"
	class="grid sm:grid-col-2 xl:grid-cols-3 bg-[#f1f3f4]"
>
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				successfully submitted
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">Carousel Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">upload Carousel Image</Label>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<div class="mb-6">
							<Label for="large-input" class="block mb-2">Link</Label>
							<Input
								bind:value={carouselObject.link}
								id="link"
								name="link"
								size="md"
								placeholder="please, enter a valid link"
							/>
							<!-- <Message name="link" /> -->
						</div>
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<div class="mb-6">
							<Label for="large-input" class="block mb-2">Type</Label>
							<Select
								bind:value={carouselObject.type}
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
					<Tabs>
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
											placeholder="Enter Subtitle"
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
</div>
