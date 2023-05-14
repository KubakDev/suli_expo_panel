<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea } from 'flowbite-svelte';
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

	let value = '';
	let conf = {
		a11y_advanced_options: true,
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
	getNewsDetail();
	function getNewsDetail() {
		data.supabase
			.from('news')
			.select('*')
			.eq('id', +data.newsId)
			.single()
			.then((res) => {
				cardData = {
					title: res.data?.title,
					thumbnail: res.data?.thumbnail,
					created_at: new Date(res.data?.created_at),
					imgSource: ImgSourceEnum.local,
					short_description: res.data?.short_description
				};
				detailData = {
					title: res.data?.title,
					long_description: res.data?.long_description,
					images: res.data?.images.split(',').map((imgurl: string, index: number) => {
						return {
							imgurl,
							id: index,
							imgSource: ImgSourceEnum.remote
						};
					})
				};
				console.log(detailData);
				value = res.data?.long_description;
			});
	}
	function handleFileUpload(e: Event) {
		console.log('handleFileUpload');
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput!.files![0];
		thumbnailFile = file;
		const reader = new FileReader();
		reader.onloadend = () => {
			cardData.thumbnail = reader.result as string;
			cardData.imgSource = ImgSourceEnum.local;
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
			await data.supabase.from('news').insert({
				title: cardData.title,
				thumbnail: cardData?.thumbnail,
				created_at: new Date(),
				short_description: cardData.short_description,
				long_description: detailData.long_description,
				images: detailImages.toString()
			});
		}
	}
	onMount(async () => {
		newsCardComponent = CardComponent;

		await getNewsUi(data.supabase);
		let card = $newsUiStore?.component?.title;
		const module = await import('kubak-svelte-component');

		CardComponent = module[card as keyof typeof module];
	});
	$: {
		// detailData.long_description = value;
	}
	function getImages(e: { detail: [] }) {
		let updatedData = detailData;
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
		detailData = updatedData;
		console.log(detailData.images);
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
					<Label for="first_name" class="mb-2">Card Title</Label>
					<Input type="text" id="first_name" placeholder="The Story" bind:value={cardData.title} />
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>upload Card Image</span>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Date</span>
						<DateInput bind:value={cardData.created_at} format="yyyy/MM/dd" />
					</Label>
				</div>
				<div class="col-span-3">
					<Label for="textarea-id" class="mb-2">short description</Label>
					<Textarea
						id="textarea-id"
						placeholder="short description"
						rows="4"
						name="message"
						bind:value={cardData.short_description}
					/>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />
				<h1 class="text-xl font-bold">News Detail</h1>
				<div class="col-span-3 w-full" style="height: 400px;">
					<Editor
						apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
						channel="5"
						text="readonly-text-output"
						cssClass="tinymce-wrapper"
						bind:value
						{conf}
					/>
				</div>
				<br />
			</div>
			<div class="">
				<FileUploadComponent
					on:imageChanges={getImages}
					on:imageFilesChanges={getAllImageFile}
					data={{ images: detailData.images }}
				/>
			</div>
			<Button on:click={submitForm} class="my-2">Submit</Button>
		</form>
	</div>

	<div class=" h-full p-2">
		<Tabs>
			<TabItem open title="News List">
				{#if $newsUiStore}
					<div class=" w-full bg-[#3E4248] rounded-md p-10 flex justify-center">
						<div class="w-[600px]">
							{#if newsCardComponent}
								<svelte:component
									this={newsCardComponent}
									data={cardData}
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
				<div class=" w-full bg-[#3E4248] rounded-md p-10">
					<NewsDetail data={detailData} />
				</div>
			</TabItem>
		</Tabs>
	</div>
</div>
