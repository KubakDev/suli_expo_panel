<script lang="ts">
	import { Dropzone } from 'flowbite-svelte';
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { Photo, XMark } from 'svelte-heros-v2';
	import { ImgSourceEnum } from '../../models/imgSourceEnum';
	import { onMount } from 'svelte';
	import type { ImagesModel } from '../../models/imagesModel';

	export let data: { images?: ImagesModel[] } = {};
	let images: ImagesModel[] = data.images ?? [];

	afterUpdate(() => {
		if (images.length === 0) {
			images = data.images ?? [];
		}
	});
	const dispatch = createEventDispatcher();
	let imageFiles: File[] = [];

	function addImage(e: Event) {
		console.log('//////e', e);
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
		console.log('//////i', images);
	}

	$: {
		if (images.length > 0) {
			runEvent();
		}
	}

	function runEvent() {
		dispatch('imageChanges', images);
		dispatch('imageFilesChanges', imageFiles);
	}
</script>

<div class="w-full h-80 bg-[#e4e4e4] rounded-lg p-5 flex flex-wrap">
	<div class="w-24 h-24">
		<Dropzone
			multiple
			id="dropzone"
			type="file"
			accept=".jpg, .jpeg, .png .svg"
			on:change={(e) => addImage(e)}
			defaultClass="flex flex-col justify-center items-center w-full h-full bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
			>Upload</Dropzone
		>
	</div>
	{#each images as image, index}
		<div class="h-24 w-24 bg-[#f1f3f4] mx-2 rounded-lg relative">
			<button
				class="bg-red-700 absolute -top-2 -right-2 rounded-full border-2 cursor-pointer"
				on:click={(event) => {
					event.stopPropagation();
					deleteImage(index);
				}}
			>
				<XMark class="text-xs h-5 w-5 text-white" />
			</button>
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
