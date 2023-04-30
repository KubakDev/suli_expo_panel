<script lang="ts">
	import { Label, Checkbox, A, Button, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { NewsDetail, SimpleCard } from 'kubak-svelte-component';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import newsUi from '../../../stores/ui/newsUi';
	import { supabase } from '../../../supabase';

	export let data: PageData;

	let cardData = {
		title: '',
		date: '',
		description: '',
		img: 'https://cdn.pixabay.com/photo/2015/04/19/08/32/marguerite-729510__340.jpg'
	};
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
			cardData.img = reader.result as string;
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
	async function submitForm() {
		console.log('cardData');
		const { data, error } = await supabase.storage
			.from('image')
			.upload('images/my-image.png', cardData.img);
		console.log('data', data);
		console.log('error', error);
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
					<Label for="title" class="mb-2">First name</Label>
					<Input type="text" id="title" placeholder="John" required bind:value={detailData.title} />
				</div>
				<div class="col-span-2">
					<Label for="textarea-id" class="mb-2">Your message</Label>
					<Textarea
						id="textarea-id"
						placeholder="Your message"
						rows="4"
						name="message"
						class="h-44"
						bind:value={detailData.description}
					/>
				</div>
				<div>
					<Label class="space-y-2 mb-2">
						<span>Upload file</span>
						<Fileupload on:change={addSliderImages} />
					</Label>
				</div>
				<Button type="submit">Submit</Button>
			</div>
		</form>
	</div>
	<div class=" h-full p-2">
		<Tabs>
			<TabItem open title="News List">
				<div class=" w-full bg-[#3E4248] rounded-md p-10">
					<SimpleCard data={cardData} colors={$newsUi[0].color_palette} />
				</div>
			</TabItem>
			<TabItem title="News Detail">
				<div class=" w-full bg-[#3E4248] rounded-md p-10">
					<NewsDetail data={detailData} />
				</div>
			</TabItem>
		</Tabs>
		<!-- <div class=" w-full bg-[#3E4248] rounded-md p-10">
			<NewsDetail />
		</div> -->
	</div>
</div>
