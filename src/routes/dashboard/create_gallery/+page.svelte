<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Select } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/galleryStore';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { GalleryModel, GalleryModelLang } from '../../../models/galleryModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';

	export let data;

	let fileName: string;
	let imageFile: File | undefined;

	let selectedLanguageTab = LanguageEnum.EN;

	let galleryDataLang: GalleryModelLang[] = [];
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);
	// console.log(languageEnumKeys);

	const languageEnumLength = languageEnumKeys.length;
	//for swapping between language
	for (let i = 0; i < languageEnumLength; i++) {
		galleryDataLang.push({
			title: '',
			short_description: '',
			long_description: '',
			created_at: new Date(),
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	let galleryObject: GalleryModel = {
		images: [],
		thumbnail: '',
		created_at: new Date()
	};

	// generate random number before image URl
	function getRandomTextNumber() {
		const random =
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		return random;
	}

	// for upload thumbnail image
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;
		// console.log(file);
		const reader = new FileReader();

		reader.onloadend = () => {
			galleryObject.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `gallery/${randomText}_${file.name}`; // Append random text to the file name

			// console.log(galleryObject);
		};

		reader.readAsDataURL(file);
	}

	//upload multiple images
	const galleryFiles: { file: File; fileName: string }[] = [];
	async function handleMultipleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const files = fileInput.files;

		if (files) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				const reader = new FileReader();

				reader.onloadend = async () => {
					const randomText = getRandomTextNumber(); // Generate random text
					let fileName = `gallery/${randomText}_${file.name}`;
					// Append random text to the file name
					galleryFiles.push({
						file: file,
						fileName: fileName
					});
				};

				reader.readAsDataURL(file);
			}
		}
		console.log('galleryFiles', galleryFiles);
	}

	let submitted = false;
	let showToast = false;

	async function formSubmit() {
		submitted = true;
		showToast = true;
		const response = await data.supabase.storage.from('image').upload(`${fileName}`, imageFile!);

		// for (let gallery of galleryFiles) {
		// 	const responseMultiple = await data.supabase.storage
		// 		.from('image')
		// 		.upload(`${gallery.fileName}`, gallery.file!);
		// 	galleryObject.images.push(responseMultiple.data?.path);
		// }

		for (const fileObj of galleryFiles) {
			const response2 = await data.supabase.storage
				.from('image')
				.upload(fileObj.fileName, fileObj.file!);

			console.log(galleryObject);
			galleryObject.images.push(response2.data?.path);
		}

		// console.log(response);
		galleryObject.thumbnail = response.data?.path;
		insertData(galleryObject, galleryDataLang, data.supabase);
		resetForm();
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	function resetForm() {
		submitted = false;

		galleryObject = {
			images: [],
			thumbnail: '',
			created_at: new Date()
		};

		galleryDataLang = []; // Resetting galleryDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			galleryDataLang.push({
				title: '',
				short_description: '',
				long_description: '',
				created_at: new Date(),
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
			<h1 class="text-xl font-bold mb-8">Gallery Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<!-- upload thumbnail image  -->
				<div>
					<Label class="space-y-2 mb-2">
						<Label for="first_name" class="mb-2">Upload Gallery Image</Label>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={galleryObject.created_at} format="yyyy/MM/dd" />
					</Label>
				</div>

				<br />

				<div class="col-span-3">
					<Tabs>
						{#each galleryDataLang as langData}
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
										<Label for="first_name" class="mb-2">Gallery Title</Label>
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
											placeholder="Enter Subtitle"
											rows="4"
											bind:value={langData.short_description}
											id="short_description"
											name="short_description"
										/>
										<!-- <Message name="short_description" /> -->
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">long description</Label>
										<Textarea
											placeholder="Enter Subtitle"
											rows="4"
											bind:value={langData.long_description}
											id="long_description"
											name="long_description"
										/>
										<!-- <Message name="long_description" /> -->
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>

			<!-- upload gallery image -->
			<div>
				<Label class="space-y-2 mb-2">
					<Label for="first_name" class="mb-2">Upload Gallery Image</Label>
					<Fileupload on:change={handleMultipleFileUpload} multiple />
					<!-- <FileUploadComponent /> -->
				</Label>
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
</div>
