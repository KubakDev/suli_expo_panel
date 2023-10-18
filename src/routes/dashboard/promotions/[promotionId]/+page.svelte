<script lang="ts">
	import { Label, Input, Fileupload } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { updateData } from '../../../../stores/promoStore';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { PromoModel, PromoModelLang } from '../../../../models/promoModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CardType, ExpoCard } from 'kubak-svelte-component';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import ExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import InsertExhibitionType from '$lib/components/InsertExhibitionType.svelte';
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';

	export let data;
	let fileName: string;
	let imageFile: File | undefined;
	let showToast = false;
	let prevThumbnail: string = '';
	let isFormSubmitted = false;

	let promotionDataLang: PromoModelLang[] = [];
	let promoData: PromoModel = {
		id: 0,
		thumbnail: ''
	};

	const id = $page.params.promotionId;

	//**** get data from db and put it into the fields ****//
	async function getPromoData() {
		await data.supabase
			.from('promo')
			.select('*,promo_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				promoData = {
					id: result.data?.id,
					exhibition_id: result.data?.exhibition_id,
					thumbnail: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${result.data?.thumbnail}`
				};

				prevThumbnail = result.data?.thumbnail;

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.promo_languages.findIndex(
						(promoLang: PromoModelLang) =>
							promoLang.language == LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const promoLang = result.data?.promo_languages[index];
					promotionDataLang.push({
						title: promoLang?.title ?? '',
						video_link: promoLang?.video_link ?? '',
						language:
							promoLang?.language ?? LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				promotionDataLang = [...promotionDataLang];
				promoData = { ...promoData };
			});
	}

	onMount(async () => {
		await getPromoData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**for upload promo image**//
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput.files![0];
		imageFile = file;

		//
		const reader = new FileReader();
		reader.onloadend = () => {
			promoData.thumbnail = reader.result as '';
			const randomText = getRandomTextNumber();
			fileName = `promotions/${randomText}`;
		};
		reader.readAsDataURL(file);
	} //**for upload promo image**//

	//**Handle submit**//
	async function formSubmit() {
		let hasDataForLanguage = false;
		let isValidPromoObject = false;

		for (let lang of promotionDataLang) {
			const title = lang.title.trim();
			const video_link = lang.video_link.trim();

			const isTitleEmpty = isEmpty(title);
			const isVideo_linkEmpty = isEmpty(video_link);

			if (!isTitleEmpty || !isVideo_linkEmpty) {
				// At least one field is not empty
				hasDataForLanguage = true;
				if (isTitleEmpty || isVideo_linkEmpty) {
					// At least one field is empty for this language
					hasDataForLanguage = false;
					break;
				}
			}
		}

		if (!isEmpty(promoData.thumbnail)) {
			isValidPromoObject = true;
		}

		if (hasDataForLanguage && isValidPromoObject) {
			showToast = true;

			if (imageFile) {
				if (promoData.thumbnail) {
					await data.supabase.storage.from('image').remove([promoData.thumbnail]);
				}

				const response = await data.supabase.storage
					.from('image')
					.upload(`${fileName}`, imageFile!);
				promoData.thumbnail = response.data?.path || '';
			} else {
				promoData.thumbnail = prevThumbnail;
			}

			updateData(promoData, promotionDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/promotions');
			}, 1000);
		} else {
			isFormSubmitted = true;
			return;
		}
	}

	function handleSelectChange(event: any) {
		const selectedValue = event.target.value;
		if (selectedValue === 'Select Type') {
			delete promoData.exhibition_id;
		} else {
			promoData.exhibition_id = selectedValue;
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
			<h1 class="text-2xl font-bold">Update Promotion Data</h1>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4">
			<div class="col-span-1">
				<Label class="space-y-2 mb-2">
					<Label for="thumbnail" class="mb-2">Upload Promotion Image</Label>
					<Fileupload
						on:change={handleFileUpload}
						accept=".jpg, .jpeg, .png .svg"
						class=" dark:bg-white"
					/>
					{#if isFormSubmitted && !promoData.thumbnail.trim()}
						<p class="error-message">Please Upload an Image</p>
					{/if}
				</Label>
			</div>

			<div class="col-span-1">
				<UpdateExhibitionType {handleSelectChange} pageData={promoData} {data} />
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-4 px-4 pt-5">
			<div class="lg:col-span-2">
				<form class="rounded-lg border dark:border-gray-600">
					<Tabs contentClass="dark:bg-gray-900">
						{#each promotionDataLang as langData}
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
										<Label for="first_name" class="mb-2">Promotion Title</Label>

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
									<div class="pb-5">
										<Label for="link" class="mb-2">Promotion video_link</Label>

										<Input
											type="text"
											placeholder="Enter vide"
											bind:value={langData.video_link}
											id="video_link"
											name="video_link"
										/>
										{#if !langData.video_link.trim()}
											<p class="error-message">Please enter a video_link</p>
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
					<TabItem open title="Promotion List">
						<div class="w-full rounded-md flex justify-center items-start min-h-full p-4">
							<div class="flex justify-start items-start">
								{#each promotionDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Main}
											title={langData.title}
											short_description={langData.video_link}
											thumbnail={promoData.thumbnail}
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
