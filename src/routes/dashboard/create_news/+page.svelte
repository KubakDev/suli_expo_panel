<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { DateInput } from 'date-picker-svelte';
	import { RichEditor, html, object } from 'svelte-rich-text';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { supabaseStore } from '../../../stores/supabaseStore';
	import { NewsDetail } from 'kubak-svelte-component';
	import { onMount } from 'svelte';
	import { getNewsUi } from '../../../stores/ui/newsUi';
	import newsUiStore from '../../../stores/ui/newsUi';
	import { ImgSourceEnum } from '../../../models/imgSourceEnum';
	import Editor from '@tinymce/tinymce-svelte';

	import FileUploadComponent from '$lib/components/fileUpload.svelte';

	html.subscribe((value) => {
		// do something with the html value
	});

	let CardComponent: any;
	let thumbnailFile: File | undefined;
	$: newsCardComponent = CardComponent;

	let value = '';
	let conf = {
		file_picker_callback: (cb, value, meta) => {
			console.log(cb);
			console.log(value);
			console.log(meta);
			const input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');

			input.addEventListener('change', (e) => {
				const file = e.target.files[0];
				console.log(file);
				const reader = new FileReader();
				reader.addEventListener('load', () => {
					const id = 'blobid' + new Date().getTime();
					const blobCache = tinymce.activeEditor.editorUpload.blobCache;
					const base64 = reader.result.split(',')[1];
					const blobInfo = blobCache.create(id, file, base64);
					blobCache.add(blobInfo);

					cb(blobInfo.blobUri(), { title: file.name });
				});
				reader.readAsDataURL(file);
			});

			input.click();
		},
		a11y_advanced_options: true,
		plugins: [
			// 'autolink',
			// 'autoresize',
			// 'codesample',
			// 'link',
			// 'lists',
			// 'media',
			// 'powerpaste',
			// 'table',
			// 'image',
			// 'quickbars',
			// 'codesample',
			// 'help'
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
	function handleFileUpload(e: Event) {
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
	function addSliderImages(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		for (let file of fileInput!.files!) {
			console.log(fileInput!.files);
			const reader = new FileReader();
			reader.onloadend = () => {
				const newImage = {
					imgurl: reader.result as string,
					id: detailData.images.length
				};
				const updatedData = {
					...detailData,
					images: [...detailData.images, newImage]
				};
				detailData = updatedData;
			};
			reader.readAsDataURL(file);
		}
	}

	async function submitForm(e: Event) {
		e.preventDefault();
		console.log(cardData);
		console.log(detailData);
		const supabase = $supabaseStore;
		if (!supabase) return;
		// random text number
		const random =
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

		const fileName = `${random}.${thumbnailFile?.name.split('.').pop()}`;
		const { data, error } = await supabase.storage
			.from('image')
			.upload(`images/${fileName}`, thumbnailFile!);

		if (data) {
			cardData.thumbnail = data.path;
			for (let image of detailData.images) {
				const addSliderImagesResponse = await supabase.storage
					.from('image')
					.upload(`images/${image.imgurl ?? ''}`, image.imgurl!);

				if (addSliderImagesResponse.data) {
					image.imgurl = addSliderImagesResponse.data.path;
				}
			}
		}

		console.log(cardData);
		console.log(detailData);
	}
	onMount(async () => {
		newsCardComponent = CardComponent;
		const supabase = $supabaseStore;
		if (!supabase) return;
		await getNewsUi(supabase);
		let card = $newsUiStore?.component?.title;

		const module = await import('kubak-svelte-component');
		CardComponent = module[card];
	});
	$: {
		detailData.long_description = value;
	}
	function deleteImage(index: number) {
		const updatedImages = [...detailData.images];
		updatedImages.splice(index, 1);
		// detailData.images = updatedImages;
		const updatedData = {
			...detailData,
			images: updatedImages
		};
		detailData = updatedData;
	}
	function getImages(e: { detail: [] }) {
		console.log(e.detail);
		let updatedData = detailData;
		for (let image of e.detail) {
			const newImage = {
				imgurl: image as string,
				id: detailData.images.length
			};
			updatedData = {
				...detailData,
				images: [...detailData.images, newImage]
			};
		}
		detailData = updatedData;
	}

	let startContent = [
		{
			type: 'h1',
			text: "Rich's favourite rich-text-editor"
		},
		{
			type: 'p',
			text: 'This rich editor is different than most others.',
			format: [
				{
					start: 20,
					end: 29,
					i: true
				}
			]
		}
	];

	$: {
		console.log($html);
	}

	function richText(e: Event) {
		console.log('mouse down', e);
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
				<!-- create a separate line -->
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
			<!-- <div class="p-10">
				<Table>
					<TableHead>
						<TableHeadCell>Image</TableHeadCell>
						<TableHeadCell>Actions</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each detailData.images as image, index}
							<TableBodyRow>
								<TableBodyCell>
									<img src={image.imgurl} alt="" class="h-24 w-24" />
								</TableBodyCell>
								<TableBodyCell>
									<Button outline class="!p-2" color="red" on:click={() => deleteImage(index)}>
										<Trash />
									</Button>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</div> -->
			<div class="">
				<FileUploadComponent on:imageChanges={getImages} />
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
