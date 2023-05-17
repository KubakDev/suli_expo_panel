<script lang="ts">
	import { Dropzone } from 'flowbite-svelte';
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { XMark } from 'svelte-heros-v2';
	import { ImgSourceEnum } from '../../models/imgSourceEnum';
	import { onMount } from 'svelte';

	export let data: { images?: { id: number; imgurl: string; imgSource: ImgSourceEnum }[] } = {};

	let images: { id: number; imgurl: string; imgSource: ImgSourceEnum }[] = data.images ?? [];
	afterUpdate(() => {
		if (images.length === 0) {
			images = data.images ?? [];
		}
	});
	const dispatch = createEventDispatcher();
	let imageFiles: File[] = [];
	function addImage(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		for (let file of fileInput!.files!) {
			imageFiles = [...imageFiles, file];
			const reader = new FileReader();
			reader.onloadend = () => {
				images = [
					...images,
					{
						id: images.length,
						imgurl: reader.result as string,
						imgSource: ImgSourceEnum.local
					}
				];
			};
			reader.readAsDataURL(file);
		}
	}
	function deleteImage(index: number) {
		const updatedImages = [...images];
		updatedImages.splice(index, 1);
		imageFiles.splice(index, 1);
		images = updatedImages;
	}
	$: {
		dispatch('imageChanges', images);
		dispatch('imageFilesChanges', imageFiles);
	}
</script>

<div class="w-full h-80 bg-[#e4e4e4] rounded-lg p-5 flex flex-wrap">
	<div class="h-24 w-24">
		<Dropzone
			multiple
			on:change={addImage}
			id="dropzone"
			defaultClass="flex flex-col justify-center items-center w-full h-full bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
		>
			<svg
				aria-hidden="true"
				class="mb-3 w-10 h-10 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/></svg
			></Dropzone
		>
	</div>
	{#each images as image, index}
		<div class="h-24 w-24 bg-[#f1f3f4] mx-2 rounded-lg relative">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span
				class="bg-red-700 absolute -top-2 -right-2 rounded-full p-1 border-2 cursor-pointer"
				on:click={() => deleteImage(index)}
			>
				<XMark class="text-xs h-5 w-5 text-white" />
			</span>
			<img
				src={image.imgSource == ImgSourceEnum.remote
					? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image.imgurl}`
					: image.imgurl}
				alt=""
				class="rounded-lg object-cover h-full w-full"
			/>
		</div>
	{/each}
</div>
