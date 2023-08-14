<script lang="ts">
	import { Button, Dropzone, Input, Label, Modal, Select, Spinner } from 'flowbite-svelte';
	import { Pencil, Plus, Signal } from 'svelte-heros-v2';
	import type { SeatItemModel } from './model';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { appendShapeToPlaceHolder } from './seatDesignUtils';
	import ErrorAlert from '$lib/components/alert/CustomAlert.svelte';
	import { alertStore } from '../../../stores/alertStore';
	import uploadFileStore from '../../../stores/uploadFileStore';
	import { seatItemStore } from './seatItemStore';
	import seatImageItemStore, { type SeatImageItemModel } from '../../../stores/seatImageItemStore';

	export let placeHolder: string;
	let submittedImage = 'no';
	let uploadImageModal: any = false;
	let isPenSelected = false;
	const seatWidth = 50;
	const seatHeight = 50;
	let files: any;
	let itemName: string = '';
	let selectedImageToUpload: any;
	let images: SeatImageItemModel[] = [];
	onMount(() => {
		seatImageItemStore.getAllSeatItems().then((data) => {});
	});

	$: {
		images = $seatImageItemStore;
	}

	function onSelectedImage(e: any) {}

	const seatTypes: SeatItemModel[] = [
		{ id: 'seat-a', class: 'seat seat-a', content: 'A', type: 'rect', defaultRadius: 20 }
	];

	function onSelectPen() {
		isPenSelected = !isPenSelected;
		// if (!isPenSelected) {
		// 	if (linePreview) {
		// 		linePreview.remove();
		// 		linePreview = null;
		// 	}
		// 	path.selectAll('circle').remove();
		// }
	}

	function onShapeSelected(image: SeatImageItemModel | null = null) {
		appendShapeToPlaceHolder(placeHolder, d3, image?.image_url);
	}

	function addImages() {
		// alertStore.addAlert('error', 'Error', 'error');
		uploadImageModal = true;
	}

	async function onSubmit() {
		if (itemName === '') {
			alertStore.addAlert('error', 'Please enter item name', 'error');
			return;
		}
		submittedImage = 'loading';
		const url = await uploadFileStore.uploadFile(files[0]);

		if (url) {
			const image: SeatImageItemModel = {
				image_url: url,
				name: itemName
			};

			await seatImageItemStore.uploadSeatItem(image);
			submittedImage = 'submitted';
			submittedImage = 'no';
			selectedImageToUpload = null;
			files = null;
			itemName = '';
			uploadImageModal = false;
			seatImageItemStore.getAllSeatItems();
		} else {
			alertStore.addAlert('error', 'Image Url is empty', 'error');
		}
	}

	async function onFileSelected(e: any) {
		if (files && files.length > 0) {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = (e: ProgressEvent<FileReader>) => {
				if (e.target) {
					const base64String = e.target.result as string;
					selectedImageToUpload = base64String;
				}
			};

			reader.readAsDataURL(file);
		}
	}
</script>

<div class="flex flex-col space-y-2 p-4">
	{#each seatTypes as seat}
		<div
			on:click={() => onShapeSelected(null)}
			class="seat-design p-2 bg-gray-200 rounded cursor-move"
		>
			<svg
				class={seat.class}
				xmlns="http://www.w3.org/2000/svg"
				width={seatWidth}
				height={seatHeight}
			>
				<rect width="100%" height="100%" rx="5" ry="5" />
				<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="text-sm">
					{seat.content}
				</text>
			</svg>
		</div>
	{/each}

	<div class="grid grid-cols-2 bg-gray-400 p-1 rounded-md">
		<Button on:click={() => addImages()} class="w-20 h-20 seat-design p-2  rounded cursor-move m-1">
			<Plus class="w-full h-full" />
		</Button>
		{#each images as image, index}
			<div
				on:click={() => onShapeSelected(image)}
				class="w-20 h-20 seat-design p-2 bg-gray-200 rounded cursor-move m-1"
			>
				<img class="w-full h-full" src={image.image_url} alt={image.name} />
			</div>
		{/each}
	</div>

	<Button class="!p-2 w-10 h-10 bg-red" size="lg" color={isPenSelected ? 'dark' : 'light'}>
		<Pencil
			on:click={onSelectPen}
			size="30"
			class="text-red-700 dark:text-green-700 outline-none "
		/>
	</Button>
</div>
<Modal bind:open={uploadImageModal} size="xs" autoclose={false} class="w-full">
	<Label class="space-y-2">
		<span>Name</span>
		<Input bind:value={itemName} type="email" name="Name" placeholder="Stairs" required />
	</Label>
	<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Upload Image</h3>
	<Dropzone id="dropzone" on:change={onFileSelected} bind:files>
		{#if !selectedImageToUpload}
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
			>
			<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
				<span class="font-semibold">Click to upload</span> or drag and drop
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
		{:else}
			<div class="w-full h-full">
				<img src={selectedImageToUpload} class="w-full h-full object-cover rounded-md" />
			</div>
		{/if}
	</Dropzone>
	{#if submittedImage == 'no'}
		<Button on:click={onSubmit} class="w-full1">Submit</Button>
	{:else if submittedImage == 'submitted'}
		<Signal />
	{:else}
		<Spinner />
	{/if}
</Modal>

<style>
	.custom-cursor {
		cursor: crosshair;
	}
	.h-screen {
		height: 100vh;
	}
	.cursor-move {
		cursor: move;
	}

	.circle {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
	}
	.seat {
		user-select: none;
		fill: none;
		stroke: currentColor;
	}
	.seat-a {
		color: #1f2937;
	}
	.seat-b {
		color: #3b82f6;
	}
	.seat-c {
		color: #9333ea;
	}
	.rotate-handle {
		left: -24px;
		top: -24px;
		cursor: grab;
		color: red;
	}
</style>
