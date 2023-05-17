<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Helper, Spinner } from 'flowbite-svelte';
	import { DateInput } from 'date-picker-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { supabaseStore } from '../../../stores/supabaseStore';
	import { NewsDetail } from 'kubak-svelte-component';
	import { onMount } from 'svelte';
	import { getNewsUi } from '../../../stores/ui/newsUi';
	import newsUiStore from '../../../stores/ui/newsUi';
	import { ImgSourceEnum } from '../../../models/imgSourceEnum';
	import Editor from '@tinymce/tinymce-svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';
	import * as yup from 'yup';
	import loading from '../../../stores/loading';
	import { changeLoadingStatus } from '../../../stores/loading';
	import { goto } from '$app/navigation';

	export let data;
	let CardComponent: any;
	let thumbnailFile: File | undefined;
	let sliderImagesFile: File[] = [];
	$: newsCardComponent = CardComponent;

	let invalidateFields: {
		title: boolean;
		short_description: boolean;
		thumbnail: boolean;
	} = {
		title: false,
		short_description: false,
		thumbnail: false
	};

	const schema = yup.object().shape({
		title: yup.string().required(),
		short_description: yup.string().required(),
		thumbnail: yup.string().required()
	});
	let value = '';
	let conf = {
		file_picker_callback: (cb: any, value: any, meta: any) => {
			const input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');

			input.addEventListener('change', (e: any) => {
				const file = e.target.files[0];
				const reader: any = new FileReader();
				reader.addEventListener('load', () => {
					const id = 'blobid' + new Date().getTime();
					// const blobCache = tinymce.activeEditor.editorUpload.blobCache;
					const base64 = reader?.result?.split(',')[1];
					// const blobInfo = blobCache.create(id, file, base64);
					// blobCache.add(blobInfo);

					// cb(blobInfo.blobUri(), { title: file.name });
				});
				reader.readAsDataURL(file);
			});
			input.click();
		},
		a11y_advanced_options: true,
		plugins: [
			'autolink',
			'autoresize',
			'codesample',
			'link',
			'lists',
			'media',
			'powerpaste',
			'table',
			'image',
			'quickbars',
			'codesample',
			'help'
		],
		toolbar:
			'image undo redo newdocument  bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat'
	};
	let cardData: {
		title: string;
		thumbnail: string;
		created_at: Date;
		imgSource: ImgSourceEnum;
		short_description: string;
	} = {
		title: '',
		thumbnail: '',
		created_at: new Date(),
		imgSource: ImgSourceEnum.remote,
		short_description: ''
	};

	let detailData: {
		title: string;
		long_description: string;
		images: { imgurl: string; id: number }[];
	} = {
		title: '',
		long_description: '',
		images: []
	};
	let newsLangData: {
		title: string;
		short_description: string;
		long_description: string;
		language: string;
	}[] = [
		{
			title: '',
			short_description: '',
			long_description: '',
			language: 'en'
		},
		{
			title: '',
			short_description: '',
			long_description: '',
			language: 'ckb'
		},
		{
			title: '',
			short_description: '',
			long_description: '',
			language: 'ar'
		}
	];
	let newsData: {
		thumbnail: string;
		images: string[];
		imgSource: ImgSourceEnum;
	} = {
		thumbnail: '',
		images: [],
		imgSource: ImgSourceEnum.local
	};
	let selectedLanguageTab = 'en';
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput!.files![0];
		thumbnailFile = file;
		const reader = new FileReader();
		reader.onloadend = () => {
			cardData.thumbnail = reader.result as string;
			cardData.imgSource = ImgSourceEnum.local;
			newsData.thumbnail = reader.result as string;
			newsData.imgSource = ImgSourceEnum.local;
		};
		reader.readAsDataURL(file);
	}
	function getRandomTextNumber() {
		const random =
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		return random;
	}
	async function submitForm(e: Event) {
		console.log(newsLangData);

		let valid = false;
		invalidateFields = {
			title: false,
			short_description: false,
			thumbnail: false
		};
		e.preventDefault();
		await schema
			.validate({
				title: cardData.title,
				short_description: cardData.short_description,
				thumbnail: cardData.thumbnail
			})
			.then((value) => {
				changeLoadingStatus(true);
				valid = true;
			})
			.catch((err) => {
				invalidateFields = {
					...invalidateFields,
					[err.path]: true
				};
			});
		// if (valid) {
		if (!data.supabase) return;
		const fileName = `${getRandomTextNumber()}.${thumbnailFile?.name.split('.').pop()}`;
		const response = await data.supabase.storage
			.from('image')
			.upload(`images/${fileName}`, thumbnailFile!);
		cardData.thumbnail = response.data?.path!;
		newsData.thumbnail = response.data?.path!;
		if (response) {
			let detailImages = [];
			for (let file of sliderImagesFile) {
				let SliderFileName = `${getRandomTextNumber()}.${file?.name.split('.').pop()}`;
				const response = await data.supabase.storage
					.from('image')
					.upload(`images/${SliderFileName}`, file!);
				if (response.data) {
					detailImages.push(response.data.path);
				}
			}
			newsData.images = detailImages;
			console.log(newsData.images);

			await data.supabase.rpc('insert_news_and_news_lang', {
				news_data: {
					thumbnail: newsData.thumbnail,
					images: newsData.images.toString()
				},
				news_lang_data: newsLangData
			});

			changeLoadingStatus(false);
			goto('/dashboard/news');
		}
	}
	onMount(async () => {
		newsCardComponent = CardComponent;
		const supabase = $supabaseStore;
		if (!supabase) return;
		await getNewsUi(supabase);
		let card = $newsUiStore?.component?.title;
		const module = await import('kubak-svelte-component');

		CardComponent = module[card as keyof typeof module];
	});
	$: {
		detailData.long_description = value;
	}
	function getImages(e: { detail: [] }) {
		let updatedData = detailData;
		let updatedNewsData = newsData;
		updatedNewsData = {
			...updatedNewsData,
			images: []
		};
		updatedData = {
			...updatedData,
			images: []
		};
		for (let image of e.detail) {
			const newImage = image;
			updatedNewsData = {
				...updatedNewsData,
				images: [...updatedNewsData.images, newImage]
			};
			updatedData = {
				...updatedData,
				images: [...updatedData.images, newImage]
			};
		}
		detailData = updatedData;
		newsData = updatedNewsData;
		console.log(newsData);
	}
	function getAllImageFile(e: { detail: File[] }) {
		sliderImagesFile = e.detail;
	}
</script>

<div
	style="min-height: calc(100vh - 160px);"
	class="grid sm:grid-col-2 xl:grid-cols-3 bg-[#f1f3f4]"
>
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		<form class="py-10">
			<h1 class="text-xl font-bold mb-8">News Card Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<div>
					<Label class="space-y-2 mb-2">
						<Label
							for="first_name"
							class="mb-2"
							color={invalidateFields.thumbnail ? 'red' : undefined}>upload Card Image</Label
						>
						<Fileupload
							on:change={handleFileUpload}
							color={invalidateFields.thumbnail ? 'red' : 'base'}
						/>
						{#if invalidateFields.thumbnail}
							<Helper class="mt-2" color="red">
								<span class="font-medium">thumbnail is required!</span>
							</Helper>
						{/if}
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={cardData.created_at} format="yyyy/MM/dd" />
					</Label>
				</div>
				<br />
				<div class="col-span-3">
					<Tabs>
						{#each newsLangData as langData}
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
											{`add data for ${langData.language} language`}
										</h1>
										<p>for other language navigate between tabs</p>
									</div>
									<div class="pb-10">
										<Label
											for="first_name"
											class="mb-2"
											color={invalidateFields.title ? 'red' : undefined}>Card Title</Label
										>
										<Input
											type="text"
											placeholder="The Story"
											bind:value={langData.title}
											color={invalidateFields.title ? 'red' : 'base'}
										/>
										{#if invalidateFields.title}
											<Helper class="mt-2" color="red">
												<span class="font-medium">title is required!</span>
											</Helper>
										{/if}
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">short description</Label>
										<Textarea
											id="textarea-id"
											placeholder="short description"
											rows="4"
											name="message"
											bind:value={langData.short_description}
										/>
										{#if invalidateFields.short_description}
											<Helper class="mt-2" color="red"
												><span class="font-medium">short description is required!</span>
											</Helper>
										{/if}
									</div>
									<h1 class="text-xl font-bold">News Detail</h1>
									<div class="pt-4 w-full" style="height: 400px;">
										<Editor
											apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
											channel="5"
											text="readonly-text-output"
											cssClass="tinymce-wrapper"
											bind:value={langData.long_description}
											{conf}
										/>
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>
			<div class="">
				<FileUploadComponent on:imageChanges={getImages} on:imageFilesChanges={getAllImageFile} />
			</div>
			<div class="w-full flex justify-end mt-2">
				<Button on:click={submitForm} class="my-2 "
					>{#if $loading}
						<Spinner class="mr-3" size="4" />
					{/if}Submit</Button
				>
			</div>
		</form>
	</div>

	<div class=" h-full p-2">
		<Tabs>
			<TabItem open title="News List">
				{#if $newsUiStore}
					<div
						class=" w-full bg-[#3E4248] rounded-md p-10 flex justify-center items-center"
						style="min-height: calc(100vh - 300px);"
					>
						<div class="w-[600px]">
							{#if newsCardComponent}
								<svelte:component
									this={newsCardComponent}
									data={newsLangData.find((item) => item.language == selectedLanguageTab)}
									imageData={{
										thumbnail: newsData.thumbnail,
										imgSource: newsData.imgSource
									}}
									colors={$newsUiStore.color_palette}
								/>
							{:else}
								<div />
							{/if}
						</div>
					</div>
				{/if}
			</TabItem>
			<TabItem title="News Detail">
				<div class=" w-full bg-[#3E4248] rounded-md p-10" style="min-height: calc(100vh - 300px);">
					<NewsDetail
						long_description={newsLangData.find((item) => item.language == selectedLanguageTab)
							?.long_description}
						images={newsData.images}
					/>
				</div>
			</TabItem>
		</Tabs>
	</div>
</div>
