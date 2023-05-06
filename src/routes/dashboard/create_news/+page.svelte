<script lang="ts">
	import { Label, Checkbox, A, Button, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { supabaseStore } from '../../../stores/supabaseStore';
	import { NewsDetail, SimpleCard } from 'kubak-svelte-component';
	import { onMount } from 'svelte';
	import { getNewsUi } from '../../../stores/ui/newsUi';
	import newsUiStore from '../../../stores/ui/newsUi';
	let cardData: {
		title: string;
		date: string;
		description: string;
		img: string;
	} = {
		title: '',
		date: '',
		description: '',
		img: ''
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
			cardData.img = file;
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
		const supabase = $supabaseStore;
		if (!supabase) return;
		const { data, error } = await supabase.storage
			.from('image')
			.upload(`images/${cardData.img?.name ?? ''}`, cardData.img!);
	}

	onMount(async () => {
		const supabase = $supabaseStore;
		if (!supabase) return;
		getNewsUi(supabase);
	});
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
				{#if $newsUiStore}
					<div class=" w-full bg-[#3E4248] rounded-md p-10">
						<SimpleCard data={cardData} colors={$newsUiStore.color_palette} />
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
