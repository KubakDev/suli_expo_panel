<script lang="ts">
	import { Label, Input, Fileupload, Textarea, Img } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/aboutStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { AboutModel, AboutModelLang } from '../../../models/aboutModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { CardType, ExpoCard, DetailPage } from 'kubak-svelte-component';
	import { goto } from '$app/navigation';
	import Editor from '@tinymce/tinymce-svelte';

	export let data;

	let submitted = false;
	let showToast = false;
	let fileName: string;
	let imageFile: File | undefined;
	let carouselImages: any = undefined;
	let selectedLanguageTab = LanguageEnum.EN;

	let aboutDataLang: AboutModelLang[] = [];

	let aboutObject: AboutModel = {
		image: '',
		created_at: new Date(),
		id: 0
	};

	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		aboutDataLang.push({
			short_description: '',
			long_description: '',
			created_at: new Date(),
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
			aboutObject.image = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `about/${randomText}_${file.name}`; // Append random text to the file name

			// console.log('aboutObject////////////', aboutObject);
		};

		reader.readAsDataURL(file);
	}

	async function formSubmit() {
		submitted = true;
		showToast = true;

		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);

		// console.log(response);
		aboutObject.image = response.data?.path;

		insertData(aboutObject, aboutDataLang, data.supabase);

		resetForm();
		goto('/dashboard/about');
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		aboutObject = {
			image: '',
			created_at: new Date(),
			id: 0
		};

		aboutDataLang = []; // Resetting aboutDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			aboutDataLang.push({
				short_description: '',
				long_description: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}

	const conf = {
		toolbar:
			'undo redo | a11ycheck casechange blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | ' +
			'bullist numlist checklist outdent indent | removeformat | code table help',
		plugins: [
			'a11ychecker',
			'advlist',
			'advcode',
			'advtable',
			'autolink',
			'checklist',
			'export',
			'lists',
			'link',
			'image',
			'charmap',
			'preview',
			'anchor',
			'searchreplace',
			'visualblocks',
			'powerpaste',
			'fullscreen',
			'formatpainter',
			'insertdatetime',
			'media',
			'table',
			'help',
			'wordcount'
		],
		height: 500
	};
</script>

<div style="min-height: calc(100vh - 160px);" class="grid grid-col-1 lg:grid-cols-3 bg-[#f1f3f4]">
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				successfully submitted
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">About Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Image</Label>
						<Fileupload on:change={handleFileUpload} accept=".jpg, .jpeg, .png .svg" />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={aboutObject.created_at} format="yyyy/MM/dd" />
					</Label>
				</div>

				<br />

				<div class="col-span-3">
					<Tabs>
						{#each aboutDataLang as langData}
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
										<Label for="textarea-id" class="mb-2">Short description</Label>
										<Textarea
											placeholder="Enter short description"
											rows="4"
											bind:value={langData.short_description}
											id="short_description"
											name="short_description"
										/>
										<!-- <Message name="short_description" /> -->
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">About Paragraph</Label>
										<div class="pt-4 w-full" style="height: 400px;">
											<Editor
												apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
												channel="5-dev"
												text="readonly-text-output"
												bind:value={langData.long_description}
												{conf}
											/>
										</div>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>

			<!-- submit Form -->
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
		<div>
			<Tabs style="underline">
				<TabItem open title="About List">
					<div
						class=" w-full bg-[#cfd3d63c] rounded-md p-10 flex justify-center items-start"
						style="min-height: calc(100vh - 300px);"
					>
						<div class="flex justify-start items-start">
							{#each aboutDataLang as langData}
								{#if langData.language === selectedLanguageTab}
									<ExpoCard
										title=""
										cardType={CardType.Main}
										short_description={langData.short_description}
										thumbnail={aboutObject.image}
										primaryColor="bg-primary"
									/>
								{/if}
							{/each}
						</div>

						<div />
					</div>
				</TabItem>
				<TabItem title="About Detail">
					{#each aboutDataLang as langData}
						{#if langData.language === selectedLanguageTab}
							<DetailPage
								imagesCarousel={carouselImages}
								long_description={langData.long_description}
							/>
						{/if}
					{/each}
				</TabItem>
			</Tabs>
		</div>
	</div>
</div>
