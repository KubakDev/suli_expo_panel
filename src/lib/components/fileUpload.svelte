<script lang="ts">
	import { Dropzone } from 'flowbite-svelte';
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { XMark } from 'svelte-heros-v2';
	import { ImgSourceEnum } from '../../models/imgSourceEnum';
	import type { ImagesModel } from '../../models/imagesModel';

	// Import a loading spinner component (you can use an existing library or create your own)
	import { Shadow } from 'svelte-loading-spinners';

	export let data: { images?: ImagesModel[] } = {};
	let images: ImagesModel[] = data.images ?? [];
	let isUploading = false; // Add the isUploading variable to track the upload status
	let uploadCount = 0;
	afterUpdate(() => {
		if (images.length === 0) {
			images = data.images ?? [];
		}
	});
	const dispatch = createEventDispatcher();
	let imageFiles: File[] = [];

	function addImage(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const totalFiles = fileInput?.files?.length; // Total number of files being uploaded

		for (let file of fileInput!.files!) {
			imageFiles = [...imageFiles, file];

			const reader = new FileReader();
			reader.onloadend = () => {
				let fileName = file.name;
				images = [
					...images,
					{
						id: images.length,
						imgurl: reader.result as string,
						imgSource: ImgSourceEnum.local,
						fileName: fileName
					}
				];

				uploadCount++;

				if (uploadCount === totalFiles) {
					isUploading = false;
					uploadCount = 0;
				}
			};
			reader.readAsDataURL(file);
		}

		isUploading = true;
	}

	function deleteImage(index: number) {
		const updatedImages = [...images];
		updatedImages.splice(index, 1);
		imageFiles.splice(index, 1);
		images = updatedImages;
	}

	$: {
		if (images.length > 0) {
			runEvent();
		}
	}

	function runEvent() {
		dispatch('imageChanges', images);
		dispatch('imageFilesChanges', imageFiles);
		isUploading = false; // Set isLoading to false after the image is uploaded
	}
</script>

<div class="px-8">
	<Dropzone
		multiple
		id="dropzone"
		type="file"
		accept=".jpg, .jpeg, .png, .svg"
		on:change={addImage}
		class="h-32 cursor-auto"
	>
		{#if isUploading}
			<!-- Show the loading spinner while uploading images -->
			<Shadow size="50" color="#FF3E00" unit="px" duration="1s" />
		{:else}
			<span class="bg-primary-dark p-3 rounded-3xl font-semibold text-white cursor-pointer"
				>Upload Image File</span
			>
		{/if}
	</Dropzone>
	<div class="pt-5" />
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
		{#each images as image, index}
			<div class="w-full h-32 bg-[#f1f3f4] rounded-lg relative">
				<button
					class="bg-red-700 absolute -top-2 -right-2 rounded-full border-"
					on:click={(event) => {
						event.stopPropagation();
						deleteImage(index);
					}}
				>
					<XMark class="text-xs text-white" />
				</button>
				<img
					src={image.imgSource == ImgSourceEnum.remote
						? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image.imgurl}`
						: image.imgurl}
					alt=""
					class="rounded-lg object-cover h-full w-full border"
				/>
			</div>
		{/each}
	</div>
</div>
