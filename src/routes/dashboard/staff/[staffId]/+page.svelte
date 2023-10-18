<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/staffStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { StaffModel, StaffModelLang } from '../../../../models/staffModel';
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

	let staffDataLang: StaffModelLang[] = [];
	let staffData: StaffModel = {
		id: 0,
		image: ''
	};
	const id = $page.params.staffId;

	//**** get data from db and put it into the fields ****//
	async function getStaffData() {
		await data.supabase
			.from('staff')
			.select('*,staff_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				staffData = {
					id: result.data?.id,
					image: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.image}`
				};

				prevThumbnail = result.data?.image;

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.staff_languages.findIndex(
						(staffLang: StaffModelLang) =>
							staffLang.language == LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const staffLang = result.data?.staff_languages[index];
					staffDataLang.push({
						title: staffLang?.title ?? '',
						name: staffLang?.name ?? '',
						language:
							staffLang?.language ?? LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				staffDataLang = [...staffDataLang];
				staffData = { ...staffData };
			});
	}

	onMount(async () => {
		await getStaffData();
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
			staffData.image = reader.result as '';

			const randomText = getRandomTextNumber(); // Generate random text
			fileName = `staff/${randomText}`; // Append random text to the file name
			//
		};
		reader.readAsDataURL(file);
	} //**for upload thumbnail image**//

	//**Handle submit**//
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidStaffObject = false;

		for (let lang of staffDataLang) {
			const title = lang.title.trim();
			const name = lang.name.trim();

			const isTitleEmpty = isEmpty(title);
			const isNameEmpty = isEmpty(name);

			if (!isTitleEmpty || !isNameEmpty) {
				// At least one field is not empty
				hasDataForLanguage = true;
				if (isTitleEmpty || isNameEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(staffData.image)) {
			isValidStaffObject = true;
		}

		if (hasDataForLanguage && isValidStaffObject) {
			submitted = true;
			showToast = true;

			if (imageFile) {
				if (staffData.image) {
					await data.supabase.storage.from('image').remove([staffData.image]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				staffData.image = response.data?.path || '';
			} else {
				staffData.image = prevThumbnail;
			}

			updateData(staffData, staffDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/about');
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
			<h1 class="text-2xl font-bold">Update Staff Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="image" class="mb-2">Upload Staff Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class="dark:bg-white"
					/>
					{#if isFormSubmitted && !staffData.image.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2">
				<form class="rounded-lg border dark:border-gray-600">
					<Tabs contentClass="dark:bg-gray-900">
						{#each staffDataLang as langData}
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
										<Label for="title" class="mb-2">Title</Label>
										<Input
											type="text"
											placeholder="Enter title"
											bind:value={langData.title}
											id="title"
											name="title"
										/>
										{#if !langData.title.trim()}
											<p class="error-message">Please enter title</p>
										{/if}
									</div>

									<div class="pb-10">
										<Label for="name" class="mb-2">Full Name of member</Label>
										<Input
											type="text"
											placeholder="Enter name"
											bind:value={langData.name}
											id="name"
											name="name"
										/>
										{#if !langData.name.trim()}
											<p class="error-message">Please enter a name</p>
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
					<TabItem open title="Staff List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each staffDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description=""
											thumbnail={staffData.image}
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
