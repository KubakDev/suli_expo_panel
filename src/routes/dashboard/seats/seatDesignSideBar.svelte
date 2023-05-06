<script lang="ts">
	import { Button, Label, Select } from 'flowbite-svelte';
	import { Pencil } from 'svelte-heros-v2';
	import type { ImageModel, SeatItemModel } from './model';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { appendShapeToPlaceHolder } from './seatDesignUtils';

	export let placeHolder: string;

	let isPenSelected = false;
	const seatWidth = 50;
	const seatHeight = 50;

	let images: ImageModel[] = [
		{
			id: '1',
			url: 'https://www.easylinedrawing.com/wp-content/uploads/2020/10/flower_drawing.png',
			name: 'A'
		},
		{
			id: '2',
			url: 'https://www.southernliving.com/thmb/xFlQn020pc1NJAl4ksr7_o_B5u4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-598083938-1-22dab883ff2a43d8b2751d9f363f2d5d.jpg',
			name: 'B'
		}
	];

	function onSelectedImage(e: any) {
		console.log(e.detail.value);
	}

	const seatTypes: SeatItemModel[] = [
		{ id: 'seat-a', class: 'seat seat-a', content: 'A', type: 'rect', defaultRadius: 20 }
	];

	let selectedImage: ImageModel = images[0];

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

	function onShapeSelected(image: ImageModel | null = null) {
		appendShapeToPlaceHolder(placeHolder, d3, image?.url);
	}
</script>

<div class="flex flex-col space-y-2 p-4">
	{#each seatTypes as seat}
		<div on:click={() => onShapeSelected(null)} class="seat-design p-2 bg-gray-200 rounded cursor-move">
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

	<div class="grid grid-cols-2">
		{#each images as image}
			<div
				on:click={() => onShapeSelected(image)}
				class="w-20 h-20 seat-design p-2 bg-gray-200 rounded cursor-move"
			>
				<img class="w-full h-full" src={image.url} alt={image.name} />
			</div>
		{/each}
	</div>

	<Label
		>Select an option
		<Select value={selectedImage.url} class="mt-2" items={images} on:change={onSelectedImage} />
	</Label>

	<Button class="!p-2 w-10 h-10 bg-red" size="lg" color={isPenSelected ? 'dark' : 'light'}>
		<Pencil
			on:click={onSelectPen}
			size="30"
			class="text-red-700 dark:text-green-700 outline-none "
		/>
	</Button>
</div>

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
