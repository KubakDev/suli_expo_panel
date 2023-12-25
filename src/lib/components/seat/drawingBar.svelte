<script lang="ts">
	import { Button, Label, Modal, Dropzone, Input, Spinner } from 'flowbite-svelte';
	import { Plus, Signal } from 'svelte-heros-v2';
	import type { SeatImageItemModel } from '../../../stores/seatImageItemStore';
	import seatImageItemStore from '../../../stores/seatImageItemStore';
	import { createEventDispatcher, onMount } from 'svelte';
	import { canvasToDataUrl } from '$lib/utils/canva_to_image';
	import { alertStore } from '../../../stores/alertStore';
	import uploadFileStore from '../../../stores/uploadFileStore';
	import { Trash, XMark } from 'svelte-heros-v2';

	export let data: {
		canvas?: fabric.Canvas;
		files?: any;
		objects: any[];
		selectedObjectId: number;
		fabric: any;
	};
	// $: {
	// 	console.log(data.canvas);
	// }

	$: {
		console.log(data);
	}

	let images: SeatImageItemModel[] = [];
	let uploadImageModal = false;
	let itemName: string = '';
	let submittedImage = 'no';
	let selectedImageToUpload: any;

	const dispatch = createEventDispatcher();

	$: {
		images = $seatImageItemStore;
	}
	onMount(async () => {
		await seatImageItemStore.getAllSeatItems();
	});

	function addImages() {
		// alertStore.addAlert('error', 'Error', 'error');
		uploadImageModal = true;
	}

	function onShapeSelected(image: SeatImageItemModel | null = null) {
		let iconCanvas = new data.fabric.StaticCanvas('');
		iconCanvas.setWidth(50);
		iconCanvas.setHeight(50);

		data.fabric.Image.fromURL(
			image?.image_url!,
			function (img: any) {
				// Adjust the properties of the image if needed
				img.set({
					left: 100,
					top: 100,
					scaleX: 0.5,
					scaleY: 0.5
				});
				img.id = new Date().getTime();
				// Add the image to the canvas

				let scale = Math.max(
					iconCanvas.getWidth() / img.width!,
					iconCanvas.getHeight() / img.height!
				);
				const newImg = new data.fabric.Image(img.getElement(), {
					scaleX: scale,
					scaleY: scale,
					left: iconCanvas.getWidth() / 2,
					top: iconCanvas.getHeight() / 2,
					originX: 'center',
					originY: 'center'
				});
				iconCanvas.add(newImg);
				iconCanvas.renderAll();

				let iconDataURL = canvasToDataUrl(iconCanvas);
				img.icon = iconDataURL;

				data.canvas?.add(img);
				data.canvas?.renderAll();
				dispatch('updateLayers');
			},
			{ crossOrigin: 'anonymous' }
		);
	}
	async function onImageSubmit() {
		if (itemName === '') {
			alertStore.addAlert('error', 'Please enter item name', 'error');
			return;
		}
		submittedImage = 'loading';
		let url = undefined;
		if (data.files) {
			url = await uploadFileStore.uploadFile(data.files[0]!);
		}

		if (url) {
			const image: SeatImageItemModel = {
				image_url: url,
				name: itemName
			};

			await seatImageItemStore.uploadSeatItem(image);
			submittedImage = 'submitted';
			submittedImage = 'no';
			selectedImageToUpload = null;
			data.files = null;
			itemName = '';
			uploadImageModal = false;
			seatImageItemStore.getAllSeatItems();
		} else {
			alertStore.addAlert('error', 'Image Url is empty', 'error');
		}
	}

	async function onFileSelected(e: any) {
		if (data.files && data.files.length > 0) {
			const file = data.files[0];
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
	function removeSelectedObject() {
		let activeObject = data?.canvas?.getActiveObject();
		if (activeObject) {
			data?.canvas?.remove(activeObject);
			data?.canvas?.requestRenderAll();
		}
	}
</script>

<div class="flex flex-col p-4 bg-backgroundComponent">
	<div class="grid grid-cols-4 gap-2 rounded-md my-6">
		<Button on:click={() => addImages()} class="w-16 h-16 seat-design rounded cursor-pointer ">
			<Plus class="w-full h-full " />
		</Button>
		{#each images as image}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				on:click={() => onShapeSelected(image)}
				class="w-16 h-16 seat-design rounded cursor-move"
			>
				<img class="w-full h-full object-fit rounded" src={image.image_url} alt={image.name} />
			</div>
		{/each}
	</div>

	<Modal bind:open={uploadImageModal} size="xs" autoclose={false} class="w-full">
		<Label class="space-y-2">
			<span>Name</span>
			<Input bind:value={itemName} type="text" name="Name" placeholder="Stairs" required />
		</Label>
		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:">Upload Image</h3>
		<Dropzone id="dropzone" on:change={onFileSelected} bind:files={data.files}>
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
				<p class="text-xs text-gray-500 dark:text-gray-400">
					SVG, PNG, JPG or GIF (MAX. 800x400px)
				</p>
			{:else}
				<div class="w-full h-full">
					<img
						src={selectedImageToUpload}
						class="w-full h-full object-cover rounded-md"
						alt="notFound"
					/>
				</div>
			{/if}
		</Dropzone>
		{#if submittedImage == 'no'}
			<Button on:click={onImageSubmit} class="w-full1">Submit</Button>
		{:else if submittedImage == 'submitted'}
			<Signal />
		{:else}
			<Spinner />
		{/if}
	</Modal>
	<div class="mt-4">
		<div class=" text-xl my-4">Layers</div>
		<ul id="layers" style="height: 30vh " class="overflow-y-auto">
			{#if data && data.objects.length > 0}
				{#each data.objects as object}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<li
						data-id={object.id}
						class=" layer mb-2 p-1 rounded-md shadow-sm cursor-pointer flex justify-start items-center {object.isGroup
							? 'bg-blue-50'
							: 'bg-gray-50'}
                           {data.selectedObjectId == object.id
							? 'bg-primary-700  '
							: 'hover:bg-gray-100'}  "
						on:click={() => {
							if (data && data.canvas) {
								data.canvas.forEachObject(function (eachObject) {
									if (object.id == eachObject.id) {
										data?.canvas?.setActiveObject(eachObject);
										data?.canvas?.requestRenderAll();
									}
								});
							}
						}}
					>
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="flex justify-between w-full items-center">
							<div class="flex justify-center items-center">
								{#if object.icon}
									<img src={object.icon} alt="Object icon" class="object-icon w-8 h-8" />
								{:else}
									<div class={`${object.type} w-8 h-8 bg-black`} style="" />
								{/if}
								<div class="w-2 h-full" />
								<span>{object.type}</span>
								{#if object.isGroup}
									<ul class="ml-4">
										{#each object.children as child}
											<li
												data-id={child.id}
												class="layer mb-2 p-2 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 bg-gray-50"
											>
												<span>{child.type} {child.id + 1}</span>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								class="text-end px-3 hover:bg-gray-200 w-10 h-8 rounded flex justify-center items-center"
								on:click={removeSelectedObject}
							>
								<XMark size="20" />
							</div>
						</div>
					</li>
				{/each}
			{/if}
		</ul>
	</div>
</div>

<style lang="scss">
	.circle {
		width: 20px;
		height: 20px;
		border-radius: 50%;
	}
	.rectangle {
		height: 15px;
		width: 30px;
	}
	.ellipse {
		height: 15px;
		width: 30px;
		border-radius: 50%;
	}
	.line {
		position: relative;
		width: 25px;
		height: 2px;
		background-color: black;
		rotate: 45deg;
	}

	.triangle {
		width: 0;
		height: 0;
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-bottom: 20px solid black;
		background-color: transparent !important;
	}
</style>
