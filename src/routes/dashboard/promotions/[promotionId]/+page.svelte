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
	import UpdateExhibitionType from '$lib/components/UpdateExhibitionType.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconX, IconDeviceFloppy } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';
	
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

	let loaded = false;

	const id = $page.params.promotionId;

	//**** get data from db and put it into the fields ****//
	async function getPromoData() {
		loaded = false;
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
			loaded = true;
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

	function handleSelectChange(event: Event) {
		const selectedValue = (event.target as HTMLSelectElement).value;
		if (selectedValue === 'Select Type') {
			delete promoData.exhibition_id;
		} else {
			promoData.exhibition_id = parseInt(selectedValue, 10);
		}
	}
</script>
{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="min-h-screen bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Promotion updated successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update Promotion</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Edit promotion details and media</p>
		</div>

		<div class="grid lg:grid-cols-12 gap-6 mb-8">
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Promotion Image</span>
						<div class="relative">
							{#if promoData.thumbnail}
								<div class="absolute right-2 top-2 z-10">
									<button 
										type="button" 
										class="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											promoData.thumbnail = '';
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
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] dark:border-gray-600 dark:text-white"
							/>
						</div>
						{#if isFormSubmitted && !promoData.thumbnail.trim()}
							<p class="error-message mt-2">Please upload an image</p>
						{/if}
					</Label>
				</div>
			</div>
			<div class="lg:col-span-6">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
					<Label class="block mb-4">
						<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Exhibition Type</span>
						<UpdateExhibitionType {handleSelectChange} pageData={promoData} {data} />
					</Label>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<form>
						<Tabs contentClass="dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]" style="pill" class="p-4">
							{#each promotionDataLang as langData}
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
										<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Promotion Title</span>
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
										
										<!-- Video Link -->
										<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
											<Label class="block">
												<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Video Link</span>
												<Input
													type="text"
													placeholder="Enter video link (YouTube, Vimeo, etc.)"
													bind:value={langData.video_link}
													id="video_link"
													name="video_link"
													class="w-full"
												/>
												{#if !langData.video_link.trim()}
													<p class="error-message mt-2">Please enter a video link</p>
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
								Update Promotion
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="lg:col-span-1">
				<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-lg shadow-sm p-0 border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
					<Tabs style="pill" contentClass="dark:text-white p-4" class="px-4 pt-4">
						<TabItem open title="Preview">
							<div class="rounded-md flex justify-center items-start p-4">
								{#each promotionDataLang as langData}
									{#if langData.language === selectedLanguageTab}
										<ExpoCard
											cardType={CardType.Video}
											title={langData.title}
											short_description=""
											thumbnail={promoData.thumbnail}
											primaryColor="bg-primary"
										/>
									{/if}
								{/each}
							</div>
							<div class="p-4 mt-2 text-center">
								{#if promotionDataLang.find(lang => lang.language === selectedLanguageTab)?.video_link}
									<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
										Video Link: <span class="font-medium">{promotionDataLang.find(lang => lang.language === selectedLanguageTab)?.video_link}</span>
									</p>
								{/if}
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
