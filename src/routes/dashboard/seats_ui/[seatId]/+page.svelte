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
	import { Minus, Pencil, Plus, PlusCircle, Signal } from 'svelte-heros-v2';
	import { canvasToFile } from '$lib/utils/canva_to_image';
	import type { SeatImageItemModel } from '../../../../stores/seatImageItemStore';
	import { alertStore } from '../../../../stores/alertStore';
	import seatImageItemStore from '../../../../stores/seatImageItemStore';
	import uploadFileStore from '../../../../stores/uploadFileStore';
	import { page } from '$app/stores';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	export let data: PageData;
	let canvas: any;
	let container: any;
	let fillColor = '#000000'; // Default color

	let isDown: boolean = false;
	let line: fabric.Line | null;
	let isDrawing = false; // Whether the mouse is down
	let strokeWidth: null | string = null; // Width of the stroke
	let strokeColor = '#000000';

	let itemWidth: null | string = null;
	let itemHeight: null | string = null;

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
			// Create a rectangle with no fill, only a stroke (border)
			// Create a rectangle with no fill, only a stroke (border)
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

		const pageId = $page.params.seatId;
		if (pageId !== 'create') {
			supabase
				.from('seat_layout')
				.select('*')
				.eq('id', pageId)
				.single()
				.then(async (result) => {
					const data: any = result.data;
					console.log(data);
					if (data && data['design']) {
						await canvas.loadFromJSON(data['design'], canvas.renderAll.bind(canvas));
					}
					canvas.setDimensions({
						width: container.offsetWidth,
						height: container.offsetHeight
					});
					console.log('//////canvas.width', canvas.width);
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

					var border = new fabric.Rect({
						left: 0,
						top: 0,
						width: canvas.width,
						height: canvas.height,
						fill: 'transparent',
						stroke: 'black',
						strokeWidth: 5,
						selectable: false,
						evented: false
					});

					// Add the rectangle to the canvas
					border.toObject = () => null;
					canvas.add(border);

					// Ensure the border always stays in the back of other objects
					canvas.on('object:added', function () {
						canvas.sendToBack(border);
					});
				});
		}
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

		var panning = false;
		var lastPosX: any, lastPosY: any;
		let spacePressed = false; // state for tracking space key

		// Listen for space key down and up events on the window
		window.addEventListener('keydown', function (e) {
			if (e.code === 'Space') {
				e.preventDefault();
				spacePressed = true;
			}
		});

		window.addEventListener('keyup', function (e) {
			if (e.code === 'Space') {
				e.preventDefault();
				spacePressed = false;
				panning = false;
			}
		});

		canvas.on('mouse:down', function (options: any) {
			if (isDrawing) {
				isDown = true;
				let pointer = canvas.getPointer(options.e);
				let points = [pointer.x, pointer.y, pointer.x, pointer.y];
				line = new fabric.Line(points, {
					strokeWidth: 5,
					stroke: fillColor,
					selectable: false
				});
				canvas.add(line);
			}

			console.log('mouse down');
			if (spacePressed) {
				console.log('Starting panning');

				panning = true;
				lastPosX = options.e.clientX;
				lastPosY = options.e.clientY;
			}
		});

		canvas.on('mouse:move', function (opt: any) {
			if (isDown || isDrawing) {
				let pointer = canvas.getPointer(opt.e);
				line!.set({ x2: pointer.x, y2: pointer.y });
				canvas.requestRenderAll();
			}

			if (panning && spacePressed) {
				var delta = new fabric.Point(opt.e.clientX - lastPosX, opt.e.clientY - lastPosY);
				canvas.relativePan(delta);
				lastPosX = opt.e.clientX;
				lastPosY = opt.e.clientY;
			}
		});

		canvas.on('mouse:up', function (options: any) {
			if (isDrawing) {
				isDown = false;
				line!.set({ selectable: true, evented: true }); // set 'evented' to true to interact with the line
				line!.setControlsVisibility({ mtr: true }); // show the rotate control ('mtr')
				line!.hasControls = true; // show controls
				line = null;
			}

			panning = false;
			spacePressed = false;
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

		canvas.on('mouse:wheel', function (opt: any) {
			var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

			// Ctrl + Scroll for Windows and other platforms, Command + Scroll for MacOS
			if ((isMac && opt.e.metaKey) || (!isMac && opt.e.ctrlKey)) {
				var delta = opt.e.deltaY;
				var zoom = canvas.getZoom();
				zoom *= Math.pow(1.1, -delta / 100);
				if (zoom > 20) zoom = 20;
				if (zoom < 0.01) zoom = 0.01;
				canvas.setZoom(zoom);
				opt.e.preventDefault();
				opt.e.stopPropagation();
			}
			canvas.requestRenderAll();
		});

		canvas.on('selection:created', function (event: any) {
			var selectedObject = event.selected[0];
			setSelectedObjectValue(selectedObject);
		});
		canvas.on('selection:updated', function (event: any) {
			var selectedObject = event.selected[0];
			setSelectedObjectValue(selectedObject);
		});

		canvas.on('selection:cleared', function (event: any) {
			clearAllInput();
		});

		canvas.on('object:modified', function (event: any) {
			var modifiedObject = event.target;
			console.log(modifiedObject);
			onObjectModified(modifiedObject);
		});

		window.addEventListener('keydown', function (e) {
			// keyCode 46 corresponds to the Delete key
			console.log(e);
			if (e.key === 'Delete' || e.key === 'Backspace') {
				removeSelectedObject();
			}
		});
	});

	function clearAllInput() {
		strokeWidth = null;
		itemWidth = null;
		itemHeight = null;
	}

	function onObjectModified(selectedObject: any) {
		// selectedObject.setCoords(); // Update object's coordinates after modifications
		// if()
		if (selectedObject.scaleX !== 1 || selectedObject.scaleY !== 1) {
			itemWidth = selectedObject.getScaledWidth();
			itemHeight = selectedObject.getScaledHeight();
			console.log(itemWidth, itemHeight);
			selectedObject.set(
				{
					width: parseInt(itemWidth!) / selectedObject.scaleX - parseInt(strokeWidth!),
					height: parseInt(itemHeight!) / selectedObject.scaleY - parseInt(strokeWidth!)
				},
				{ silent: true }
			);
			// Reset scale to 1
			// selectedObject.set({ scaleX: 1, scaleY: 1 }, { silent: true });
			canvas.requestRenderAll();
		}
	}

	function setSelectedObjectValue(selectedObject: any) {
		strokeColor = selectedObject.stroke;
		strokeWidth = selectedObject.strokeWidth;
		fillColor = selectedObject.fill;
		itemWidth = selectedObject.width;
		itemHeight = selectedObject.height;
		canvas.bringToFront(selectedObject);
	}

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
		console.log(json);
		const supabase = data.supabase;
		// convert canvas to image fil	e
		const randomImageName = getRandomTextNumber();
		const canvasImage = await canvasToFile(canvas, randomImageName);
		console.log(canvasImage);
		// upload canvas image to supabase storage
		const fileResult = await supabase.storage
			.from('image')
			.upload(`seats_layout/${canvasImage.name}`, canvasImage);
		console.log(fileResult.data);

		if (!fileResult.data) {
			alertStore.addAlert('error', 'Could not convert canvas to image', 'error');
			return;
		}

		const seatId = $page.params.seatId;
		if (seatId !== 'create') {
			const result = await supabase
				.from('seat_layout ')
				.update([
					{
						name: 'text',
						design: json,
						is_active: true,
						exhibition: 1,
						image_url: fileResult.data.path
					}
				])
				.eq('id', seatId)
				.then((res) => {
					console.log(res);
				});
		} else {
			const result = await supabase
				.from('seat_layout ')
				.insert([
					{
						name: 'text',
						design: json,
						is_active: true,
						exhibition: 1,
						image_url: fileResult.data.path
					}
				])
				.then((res) => {
					console.log(res);
				});
		}
	}

	function addImages() {
		// alertStore.addAlert('error', 'Error', 'error');
		uploadImageModal = true;
	}

	function onShapeSelected(image: SeatImageItemModel | null = null) {
		fabric.Image.fromURL(
			image?.image_url!,
			function (img) {
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
			},
			{ crossOrigin: 'anonymous' }
		);
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
			width: 100,
			height: 50,
			fill: fillColor,
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

	function updateItemWidth(event: any) {
		itemWidth = event.target.value;
		updateSizeProperties();
	}

	function updateItemHeight(event: any) {
		itemHeight = event.target.value;
		updateSizeProperties();
	}

	function updateFillColor(event: any) {
		fillColor = event.target.value;
		updateFillProperties();
	}

	function updateStrokeColor(event: any) {
		strokeColor = event.target.value;
		updateStrokeProperties();
	}

	function updateStrokeWidth(event: any) {
		strokeWidth = event.target.value;
		updateStrokeProperties();
	}

	function updateSizeProperties() {
		// Get the selected object (e.g., assuming it's the last added object)
		let activeObject = canvas.getActiveObject();
		if (activeObject) {
			let scaleX = parseInt(itemWidth!) / activeObject.width;
			let scaleY = parseInt(itemHeight!) / activeObject.height;
			activeObject.set(
				{
					scaleX: scaleX,
					scaleY: scaleY
				},
				{ silent: true }
			);
			canvas.requestRenderAll();
		}
	}

	function updateFillProperties() {
		// Get the selected object (e.g., assuming it's the last added object)
		let selectedObject = canvas.getActiveObject();

		// Update the fill properties of the selected object
		selectedObject.set({
			fill: fillColor
		});

		// Trigger canvas rendering
		canvas.requestRenderAll();
	}

	function updateStrokeProperties() {
		// Get the selected object (e.g., assuming it's the last added object)
		let selectedObject = canvas.getActiveObject();

		// Update the stroke properties of the selected object
		selectedObject.set(
			{
				stroke: strokeColor,
				strokeWidth: strokeWidth != null ? parseInt(strokeWidth) : 0
			},
			{ silent: true }
		);

		// Trigger canvas rendering
		canvas.requestRenderAll();
	}

	function removeSelectedObject() {
		let activeObject = canvas.getActiveObject();
		if (activeObject) {
			canvas.remove(activeObject);
			canvas.requestRenderAll();
		}
	}

	let zoomLevel = 1;

	// Zoom In
	function zoomIn() {
		zoomLevel *= 1.1;
		canvas.setZoom(zoomLevel);
		canvas.renderAll();
	}

	// Zoom Out
	function zoomOut() {
		zoomLevel /= 1.1;
		canvas.setZoom(zoomLevel);
		canvas.renderAll();
	}
</script>

<div class="flex flex-col w-full h-full flex-1">
	<div class="flex justify-center bg-secondary border-b border-gray-500 p-2">
		<Button
			id="group-button"
			class="!p-2 mx-4 bg-red"
			size="lg"
			color={isDrawing ? 'dark' : 'light'}
			on:click={convetToObject}>Save</Button
		>
		<!-- <Button
			id="group-button"
			class="!p-2 mx-4 bg-red"
			size="lg"
			color={isDrawing ? 'dark' : 'light'}
			on:click={removeSelectedObject}>Delete</Button
		> -->
		<Button
			class="!p-2 mx-4 bg-red"
			size="lg"
			color={isDrawing ? 'dark' : 'light'}
			on:click={removeSelectedObject}>Delete</Button
		>
	</div>
	<div class="w-full grid grid-cols-6 h-full">
		<div class="flex flex-col p-4 bg-secondary">
			<div>
				<div on:click={() => createItem()} class="seat-design rounded cursor-move">
					<svg xmlns="http://www.w3.org/2000/svg" width={50} height={50}>
						<rect width="100%" height="100%" rx="5" ry="5" />
						<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="text-sm" />
					</svg>
				</div>

				<div class="grid grid-cols-2 gap-1 rounded-md my-4">
					<Button on:click={() => addImages()} class="w-20 h-20 seat-design   rounded cursor-move ">
						<Plus class="w-full h-full" />
					</Button>
					{#each images as image, index}
						<div
							on:click={() => onShapeSelected(image)}
							class="w-20 h-20 seat-design rounded cursor-move"
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
		<div bind:this={container} class="w-full col-span-4 relative">
			<canvas id="canvas" />
			<div class="absolute bottom-10 right-10 w-40 flex justify-between">
				<Button on:click={zoomIn} pill={true} outline={true} class="w-full1"><Plus /></Button>
				<Button on:click={zoomOut} pill={true} outline={true} class="w-full1"><Minus /></Button>
			</div>
		</div>
		<div class="p-4 bg-secondary">
			<input type="color" id="color-picker" bind:value={fillColor} on:input={updateFillColor} />
			<div class="grid grid-cols-2 gap-4 my-4">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>Width</InputAddon><Input
						type="number"
						size="sm"
						disabled={itemWidth === null || itemWidth === undefined}
						bind:value={itemWidth}
						on:input={updateItemWidth}
						placeholder="Width"
						let:props
					/></ButtonGroup
				>
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>Height</InputAddon><Input
						type="number"
						size="sm"
						disabled={itemWidth === null || itemWidth === undefined}
						bind:value={itemHeight}
						on:input={updateItemHeight}
						placeholder="Height"
						let:props
					/></ButtonGroup
				>
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
				<div class="flex">
					<ButtonGroup class="w-full" size="sm">
						<InputAddon
							><input
								bind:value={strokeColor}
								on:input={updateStrokeColor}
								type="color"
								id="stroke-color-picker"
							/></InputAddon
						><Input
							disabled={strokeWidth === null || strokeWidth === undefined}
							type="number"
							size="sm"
							bind:value={strokeWidth}
							on:input={updateStrokeWidth}
							placeholder="Stroke"
							let:props
						/></ButtonGroup
					>
				</div>
			</div>
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
