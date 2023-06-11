<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import { fabric } from 'fabric';
	import type { PageData } from '../$types';
	import {
		Button,
		ButtonGroup,
		Dropzone,
		Input,
		InputAddon,
		Label,
		Modal,
		Spinner
	} from 'flowbite-svelte';
	import { Pencil, Plus, Signal } from 'svelte-heros-v2';
	import type { SeatImageItemModel } from '../../../stores/seatImageItemStore';
	import seatImageItemStore from '../../../stores/seatImageItemStore';
	import { alertStore } from '../../../stores/alertStore';
	import uploadFileStore from '../../../stores/uploadFileStore';
	export let data: PageData;
	let canvas: any;
	let container: any;
	let color = '#000000'; // Default color

	let isDown: boolean = false;
	let line: fabric.Line | null;
	let isDrawing = false; // Whether the mouse is down
	let strokeWidth = 5; // Width of the stroke

	let gridSize = 20; // size of grid squares in pixels

	let uploadImageModal = false;
	let images: SeatImageItemModel[] = [];
	let itemName: string = '';
	let files: any;
	let selectedImageToUpload: any;
	let submittedImage = 'no';

	let bottomRightRadius = 0;
	let bottomLeftRadius = 0;
	let topLeftRadius = 0;
	let topRightRadius = 0;

	$: {
		images = $seatImageItemStore;
	}
	const adjustCanvasSize = () => {
		if (canvas) {
			canvas.setDimensions({
				width: container.offsetWidth,
				height: container.offsetHeight
			});
		}
	};

	function createCustomRectangle() {
		var pathData = [
			`M ${topLeftRadius} 0`,
			`Q 0 0 0 ${topLeftRadius}`,
			`L 0 ${200 - bottomRightRadius}`,
			`Q 0 200 ${bottomLeftRadius} 200`,
			`L ${200 - topRightRadius} 200`,
			`Q 200 200 200 ${200 - topRightRadius}`,
			`L 200 ${topRightRadius}`,
			`Q 200 0 ${200 - topRightRadius} 0`,
			`L ${topLeftRadius} 0`,
			`Z`
		];

		return new fabric.Path(pathData.join(' '));
	}

	async function updateCustomRectangle(value: any, type: string) {
		var activeObject = canvas.getActiveObject();

		// const allProperty = activeObject.toObject();

		// remove active object
		if (activeObject) {
			await canvas.remove(activeObject);
			await canvas.requestRenderAll();
		} else {
			return;
		}

		const radius = parseInt(value.target.value);
		switch (type) {
			case 'tl':
				topLeftRadius = radius;
				break;
			case 'tr':
				topRightRadius = radius;
				break;
			case 'bl':
				bottomLeftRadius = radius;
				break;
			case 'br':
				bottomRightRadius = radius;
				break;
			default:
				break;
		}
		// create pathdata from allProperty
		var pathData = [
			`M ${topLeftRadius} 0`,
			`Q 0 0 0 ${topLeftRadius}`,
			`L 0 ${200 - bottomRightRadius}`,
			`Q 0 200 ${bottomLeftRadius} 200`,
			`L ${200 - topRightRadius} 200`,
			`Q 200 200 200 ${200 - topRightRadius}`,
			`L 200 ${topRightRadius}`,
			`Q 200 0 ${200 - topRightRadius} 0`,
			`L ${topLeftRadius} 0`,
			`Z`
		];

		// add Property to path

		const data = new fabric.Path(pathData.join(' '));
		canvas.add(data);
		canvas.requestRenderAll();
	}

	onMount(() => {
		seatImageItemStore.getAllSeatItems();
		document.getElementById('color-picker')?.addEventListener('input', function (event) {
			let selectedColor = event.target!.value;

			// Get the selected object (e.g., assuming it's the last added object)
			let selectedObject = canvas.getObjects().pop();

			// Update the fill color of the selected object
			selectedObject.set('fill', selectedColor);

			// Trigger canvas rendering
			canvas.renderAll();
		});
		// var customRect = createCustomRectangle();

		canvas = new fabric.Canvas('canvas');

		fabric.Object.prototype.set({
			borderColor: '#5d9cec',
			cornerColor: '#5d9cec',
			cornerSize: 12,
			cornerStyle: 'circle',
			transparentCorners: false,
			borderDashArray: [2, 2],
			padding: 10,
			cornerStrokeColor: '#ffffff',
			borderOpacityWhenMoving: 0.4
		});

		const supabase = data.supabase;

		// get all seat from database
		supabase
			.from('seat_layout')
			.select('*')
			.single()
			.then(async (result) => {
				const data: any = result.data;
				console.log(data);
				if (data && data['design']) {
					await canvas.loadFromJSON(data['design'], canvas.renderAll.bind(canvas));
				}

				for (var i = 0; i < canvas.width / gridSize; i++) {
					const line = new fabric.Line([i * gridSize, 0, i * gridSize, canvas.height], {
						stroke: '#ccc',
						selectable: false
					});
					line.toObject = () => null;
					// This rect will not be included in canvas.toObject()
					const line2 = new fabric.Line([0, i * gridSize, canvas.width, i * gridSize], {
						stroke: '#ccc',
						selectable: false
					});
					line2.toObject = () => null;

					canvas.add(line);
					canvas.add(line2);
					canvas.sendToBack(line);
					canvas.sendToBack(line2);
					canvas.requestRenderAll();
					// customRect.set({ left: 10, top: 10, fill: '#D81B60' });

					// canvas.add(customRect);
				}
			});

		canvas.on('object:moving', function (options: fabric.IEvent) {
			if (options.target) {
				options.target.set({
					left: Math.round(options.target.left! / gridSize) * gridSize,
					top: Math.round(options.target.top! / gridSize) * gridSize
				});
			}
		});

		// canvas.on('object:rotating', function (options: fabric.IEvent) {
		// 	if (!options.target) return;
		// 	const object = options.target as fabric.Object;
		// 	object.angle = Math.round(object.angle! / 10) * 10;
		// });

		if (typeof window !== 'undefined') {
			window.addEventListener('resize', adjustCanvasSize);
			adjustCanvasSize();
		}

		// canvas.bringToFront(rect);
		// canvas.bringToFront(aa);
		// add a mousedown event listener to the canvas
		// canvas.on('mouse:down', function (options: any) {
		// 	console.log(options);
		// 	canvas.bringToFront(options.target);
		// 	options.e.preventDefault();
		// });

		canvas.on('mouse:down', function (options: any) {
			if (!isDrawing) return;
			isDown = true;
			let pointer = canvas.getPointer(options.e);
			let points = [pointer.x, pointer.y, pointer.x, pointer.y];
			line = new fabric.Line(points, {
				strokeWidth: 5,
				stroke: color,
				selectable: false
			});
			canvas.add(line);
		});

		canvas.on('mouse:move', function (options: any) {
			if (!isDown || !isDrawing) return;
			let pointer = canvas.getPointer(options.e);
			line!.set({ x2: pointer.x, y2: pointer.y });
			canvas.requestRenderAll();
		});

		canvas.on('mouse:up', function (options: any) {
			if (!isDrawing) return;
			isDown = false;
			line!.set({ selectable: true, evented: true }); // set 'evented' to true to interact with the line
			line!.setControlsVisibility({ mtr: true }); // show the rotate control ('mtr')
			line!.hasControls = true; // show controls
			line = null;
		});

		// Add an event listener to your group button
		document.getElementById('group-button')?.addEventListener('click', () => {
			let activeObjects = canvas.getActiveObjects();
			if (activeObjects.length > 0) {
				let group = new fabric.Group(activeObjects, {
					objectCaching: false
				});

				// Modify the position of each object to be relative to the group
				group._objects.forEach((object) => {
					object.set({
						left: object.left! - group.left!,
						top: object.top! - group.top!
					});
				});

				canvas.discardActiveObject().renderAll();
				canvas.add(group);
				canvas.setActiveObject(group);
				// Remove original objects from canvas
				activeObjects.forEach((object: any) => {
					canvas.remove(object);
				});
				canvas.requestRenderAll();
			}
		});
	});

	afterUpdate(() => {
		adjustCanvasSize();
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', adjustCanvasSize);
		}
	});

	async function convetToObject() {
		let json = canvas.toObject(['left', 'top', 'width', 'height', 'fill']);
		// You can store this `json` object into your database
		const supabase = data.supabase;
		const result = await supabase
			.from('seat_layout')
			.insert([{ name: 'text', design: json, is_active: true, exhibition: 1 }])
			.then((res) => {
				console.log(res);
			});
		console.log(result);
		console.log(json);
	}

	function addImages() {
		// alertStore.addAlert('error', 'Error', 'error');
		uploadImageModal = true;
	}

	function onShapeSelected(image: SeatImageItemModel | null = null) {
		fabric.Image.fromURL(image?.image_url!, function (img) {
			// Adjust the properties of the image if needed
			img.set({
				left: 100,
				top: 100,
				scaleX: 0.5,
				scaleY: 0.5
			});

			// Add the image to the canvas
			canvas.add(img);

			// Trigger canvas rendering
			canvas.renderAll();
		});
	}

	function onPenSelect() {
		isDrawing = !isDrawing; // Toggle the drawing mode
	}

	async function onFileSelected(e: any) {
		console.log(e);
		console.log(files[0]);
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

	async function onSubmit() {
		if (itemName === '') {
			alertStore.addAlert('error', 'Please enter item name', 'error');
			return;
		}
		submittedImage = 'loading';
		const url = await uploadFileStore.uploadFile(files[0]);
		console.log(url);
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

	function createItem() {
		let rect = new fabric.Rect({
			width: 50,
			height: 50,
			fill: 'black',
			left: 0,
			top: 0
		});
		canvas.add(rect);
	}

	function onItemRadiusChange(value: any, type: string) {
		const radius = parseInt(value.target.value);
		let selectedObject = canvas.getObjects().pop();

		// get selected object current radius and put it in a variable for all corners
		topLeftRadius = selectedObject.get('tl') || 0;
		topRightRadius = selectedObject.get('tr') || 0;
		bottomLeftRadius = selectedObject.get('bl') || 0;
		bottomRightRadius = selectedObject.get('br') || 0;
		console.log(type);
		// create a switch statement to check which corner radius to change
		switch (type) {
			case 'tl':
				topLeftRadius = radius;
				break;
			case 'tr':
				topRightRadius = radius;
				break;
			case 'bl':
				bottomLeftRadius = radius;
				break;
			case 'br':
				bottomRightRadius = radius;
				break;
			default:
				break;
		}

		selectedObject.setOptions({
			tl: topLeftRadius,
			tr: topRightRadius,
			bl: bottomLeftRadius,
			br: bottomRightRadius,
			rx: topLeftRadius,
			aCoords: {
				tl: { radius: topLeftRadius },
				tr: { radius: topRightRadius },
				bl: { radius: bottomLeftRadius },
				br: { radius: bottomRightRadius }
			}
		});
		console.log(topLeftRadius);

		console.log(selectedObject);
		// Trigger canvas rendering
		canvas.renderAll();
	}

	function addStroke(event: any) {
		let strokeWidth = parseInt(event.target.value);

		// Get the selected object (e.g., assuming it's the last added object)
		let selectedObject = canvas.getActiveObject();
		// Update the stroke properties of the selected object
		selectedObject.set({
			stroke: 'black',
			strokeWidth: strokeWidth
		});

		// Trigger canvas rendering
		canvas.renderAll();
	}
</script>

<div class="flex flex-row">
	<div>
		<div class="flex flex-col space-y-2 p-4">
			<div on:click={() => createItem()} class="seat-design p-2 bg-gray-200 rounded cursor-move">
				<svg xmlns="http://www.w3.org/2000/svg" width={50} height={50}>
					<rect width="100%" height="100%" rx="5" ry="5" />
					<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="text-sm" />
				</svg>
			</div>

			<div class="grid grid-cols-2 bg-gray-400 p-1 rounded-md">
				<Button
					on:click={() => addImages()}
					class="w-20 h-20 seat-design p-2  rounded cursor-move m-1"
				>
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

			<Button class="!p-2 w-10 h-10 bg-red" size="lg" color={isDrawing ? 'dark' : 'light'}>
				<Pencil
					on:click={onPenSelect}
					size="30"
					class="text-red-700 dark:text-green-700 outline-none "
				/>
			</Button>
		</div>
		<div class="w-1/2">
			<ButtonGroup class="w-full" size="sm">
				<InputAddon>Stroke</InputAddon><Input
					type="number"
					size="sm"
					value={strokeWidth}
					on:input={addStroke}
					placeholder="Rotation"
					let:props
				/></ButtonGroup
			>
		</div>
		<Modal bind:open={uploadImageModal} size="xs" autoclose={false} class="w-full">
			<Label class="space-y-2">
				<span>Name</span>
				<Input bind:value={itemName} type="text" name="Name" placeholder="Stairs" required />
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
					<p class="text-xs text-gray-500 dark:text-gray-400">
						SVG, PNG, JPG or GIF (MAX. 800x400px)
					</p>
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
	</div>
	<div class="flex-1">
		<button on:click={convetToObject} id="save-button">Save</button>

		<button id="group-button">Group</button>

		<button id="draw-button"><i class="fas fa-pen" /> Draw</button>
		<div bind:this={container} style="height: 100vh; width: 100%;">
			<canvas id="canvas" />
		</div>
	</div>
	<div>
		<input type="color" id="color-picker" value="#000000" />
		<div class="grid grid-cols-2 gap-2 p-4">
			<ButtonGroup class="w-full" size="sm">
				<InputAddon>(</InputAddon><Input
					type="number"
					disabled={topLeftRadius === null || topLeftRadius === undefined}
					size="sm"
					value={topLeftRadius}
					on:input={(value) => updateCustomRectangle(value, 'tl')}
					placeholder="Radius"
				/></ButtonGroup
			>
			<ButtonGroup class="w-full" size="sm">
				<InputAddon>(</InputAddon><Input
					type="number"
					disabled={topRightRadius === null || topRightRadius === undefined}
					size="sm"
					value={topRightRadius}
					on:input={(value) => updateCustomRectangle(value, 'tr')}
					placeholder="Radius"
					let:props
				/></ButtonGroup
			>
			<ButtonGroup class="w-full" size="sm">
				<InputAddon>(</InputAddon><Input
					type="number"
					disabled={bottomLeftRadius === null || bottomLeftRadius === undefined}
					size="sm"
					value={bottomLeftRadius}
					on:input={(value) => updateCustomRectangle(value, 'bl')}
					placeholder="Radius"
					let:props
				/></ButtonGroup
			>
			<ButtonGroup class="w-full" size="sm">
				<InputAddon>(</InputAddon><Input
					type="number"
					disabled={bottomRightRadius === null || bottomRightRadius === undefined}
					size="sm"
					value={bottomRightRadius}
					on:input={(value) => updateCustomRectangle(value, 'br')}
					placeholder="Radius"
					let:props
				/></ButtonGroup
			>
		</div>
	</div>
</div>

<style>
	canvas {
		border: 1px solid black;
		width: 100% !important;
	}
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
