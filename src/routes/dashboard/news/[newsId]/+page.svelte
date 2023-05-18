<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Helper } from 'flowbite-svelte';
	import { DateInput } from 'date-picker-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { NewsDetail } from 'kubak-svelte-component';
	import { onMount } from 'svelte';
	import { getNewsUi } from '../../../../stores/ui/newsUi';
	import newsUiStore from '../../../../stores/ui/newsUi';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import Editor from '@tinymce/tinymce-svelte';
	import FileUploadComponent from '$lib/components/fileUpload.svelte';

	export let data;
	interface Image {
		imgurl: string;
		imgSource: ImgSourceEnum;
		id: number;
	}

	let CardComponent: any;
	let thumbnailFile: File | undefined;
	let sliderImagesFile: File[] = [];
	$: newsCardComponent = CardComponent;

	let conf = {
		a11y_advanced_options: true,
		toolbar:
			'image undo redo newdocument  bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat'
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
	let selectedLanguageTab = 'en';
	let newsData: {
		images: { imgurl: string; id: number; imgSource: ImgSourceEnum }[];
		thumbnail: string;
		imgSource: ImgSourceEnum;
	} = {
		images: [],
		thumbnail: '',
		imgSource: ImgSourceEnum.remote
	};
	getNewsDetail();
	async function getNewsDetail() {
		const response = await data.supabase
			.from('news')
			.select(
				`*,
			news_languages(*)
			`
			)
			.eq('id', +data.newsId)
			.single();

		if (response.data) {
			console.log(response.data);
			newsLangData = response.data.news_languages;
			newsData = {
				thumbnail: response.data.thumbnail,
				images: response.data.images.split(','),
				imgSource: ImgSourceEnum.remote
			};
			newsData.images = newsData.images.map((imgurl: string, index: number) => {
				return {
					imgurl,
					id: index,
					imgSource: ImgSourceEnum.remote
				};
			});

			console.log(newsData.images);
		}
	}
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput!.files![0];
		thumbnailFile = file;
		const reader = new FileReader();
		reader.onloadend = () => {
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
		e.preventDefault();
		const fileName = `${getRandomTextNumber()}.${thumbnailFile?.name.split('.').pop()}`;
		const responseData = await data.supabase.storage
			.from('image')
			.upload(`images/${fileName}`, thumbnailFile!);
		if (responseData) {
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
		}
	}
	onMount(async () => {
		newsCardComponent = CardComponent;

		await getNewsUi(data.supabase);
		let card = $newsUiStore?.component?.title;
		const module = await import('kubak-svelte-component');

		CardComponent = module[card as keyof typeof module];
	});
	function getImages(e: { detail: [] }) {
		let updatedData = newsData;
		updatedData = {
			...updatedData,
			images: []
		};
		for (let image of e.detail as Image[]) {
			console.log(image);
			const newImage = {
				imgurl: image.imgurl,
				imgSource: image.imgSource as ImgSourceEnum,
				id: image.id
			};
			updatedData = {
				...updatedData,
				images: [...updatedData.images, newImage]
			};
		}
		newsData = updatedData;
		console.log(newsData.images);
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

			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<Label class="space-y-2 mb-2">
						<span>upload Card Image</span>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<!-- <DateInput bind:value={newsData.created_at} format="yyyy/MM/dd" /> -->
					</Label>
				</div>
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
										<Label for="first_name" class="mb-2">Card Title</Label>
										<Input type="text" placeholder="The Story" bind:value={langData.title} />
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
				<div class="bg-gray-300 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>
			<div class="">
				<FileUploadComponent
					on:imageChanges={getImages}
					on:imageFilesChanges={getAllImageFile}
					data={{ images: newsData.images }}
				/>
			</div>
			<Button on:click={submitForm} class="my-2">Submit</Button>
		</form>
	</div>

	<div class="  p-2">
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
