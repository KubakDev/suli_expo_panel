<script lang="ts">
	import { Label, Checkbox, A, Button, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { DateInput } from 'date-picker-svelte';
	import { RichEditor, html } from 'svelte-rich-text';

	import { Tabs, TabItem } from 'flowbite-svelte';
	import { supabaseStore } from '../../../stores/supabaseStore';
	import { NewsDetail, SimpleCard } from 'kubak-svelte-component';
	import { onMount } from 'svelte';
	import { getNewsUi } from '../../../stores/ui/newsUi';
	import newsUiStore from '../../../stores/ui/newsUi';
	import { ImgSourceEnum } from '../../../models/imgSourceEnum';

	html.subscribe((value) => {
		// do something with the html value
	});

	let CardComponent: any;
	$: newsCardComponent = CardComponent;

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
	let date = new Date();

	let detailData: {
		title: string;
		description: string;
		images: { imgurl: string; id: number }[];
	} = {
		title: '',
		description: '',
		images: []
	};
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput!.files![0];
		const reader = new FileReader();
		reader.onloadend = () => {
			cardData.thumbnail = reader.result as string;
			cardData.imgSource = ImgSourceEnum.local;
		};
		reader.readAsDataURL(file);
	}
	function addSliderImages(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput!.files![0];
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
	async function submitForm(e: Event) {
		e.preventDefault();
		console.log(cardData);
		// const supabase = $supabaseStore;
		// if (!supabase) return;
		// const { data, error } = await supabase.storage
		// 	.from('image')
		// 	.upload(`images/${cardData.thumbnail ?? ''}`, cardData.thumbnail!);
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
	function handleValueChange(value: any) {
		console.log(value);
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
		<form class=" " on:submit={submitForm}>
			<div class="grid gap-6 mb-6 md:grid-cols-3">
				<div>
					<Label for="first_name" class="mb-2">First name</Label>
					<Input
						type="text"
						id="first_name"
						placeholder="John"
						required
						bind:value={cardData.title}
					/>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Upload file</span>
						<Fileupload on:change={handleFileUpload} />
					</Label>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Upload file</span>
						<DateInput bind:value={cardData.created_at} format="yyyy/MM/dd" />
					</Label>
				</div>
				<div class="col-span-2">
					<Label for="textarea-id" class="mb-2">short description</Label>
					<Textarea
						id="textarea-id"
						placeholder="short description"
						rows="4"
						name="message"
						bind:value={cardData.short_description}
					/>
				</div>
				<br />
				<div>
					<Label for="title" class="mb-2">Title</Label>
					<Input
						type="text"
						id="title"
						placeholder="News Title"
						required
						bind:value={detailData.title}
					/>
				</div>
				<br />
				<div class="col-span-2">
					<Label for="textarea-id" class="mb-2">Your message</Label>
				</div>
				<br />
				<div>
					<Label class="space-y-2 mb-2">
						<span>Upload file</span>
						<Fileupload on:change={addSliderImages} />
					</Label>
				</div>
			</div>
			<Button type="submit">Submit</Button>
		</form>
	</div>
	<RichEditor content={startContent} on:mousedown={(e) => richText(e)} />
	{@html $html}
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
