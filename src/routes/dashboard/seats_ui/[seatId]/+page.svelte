<script lang="ts" type="module">
	import * as Seat from 'fabric';
	import { onMount, tick } from 'svelte';
	import type { PageData } from '../$types';
	import {
		Button,
		ButtonGroup,
		Checkbox,
		Chevron,
		Dropdown,
		Input,
		InputAddon,
		Modal,
		Search
	} from 'flowbite-svelte';
	import { Minus, Plus } from 'svelte-heros-v2';
	import type { SeatImageItemModel } from '../../../../stores/seatImageItemStore';
	import seatImageItemStore from '../../../../stores/seatImageItemStore';
	import { page } from '$app/stores';
	import { getSeatServices, seatServices } from '../../../../stores/seatServicesStore';
	import Sortable from 'sortablejs';
	import { EditingMode } from '../../../../models/editingModeModel';
	import { getImage } from '$lib/utils/getImage';
	import type { seatServicesModel } from '../../../../models/seatServicesModel';
	import AddSeatModalComponent from '../../../../lib/components/seat/addSeat.svelte';
	import TopBarComponent from '$lib/components/seat/topbar.svelte';
	import DrawingBar from '$lib/components/seat/drawingBar.svelte';
	import { LanguageEnum } from '../../../../models/languageEnum';

	let languageEnumKeys = Object.values(LanguageEnum);

	let iconCanvas = new Seat.fabric.StaticCanvas('');
	let addSeatModal = false;
	iconCanvas.setWidth(50);
	iconCanvas.setHeight(50);

	export let data: PageData;
	let canvas: any;
	let container: any;
	let fillColor = '#000000'; // Default color

	let isDown: boolean = false;
	let points: any[] = [];
	let lines: any[] = [];

	let isDrawing = false;
	let strokeWidth: null | string = null; // Width of the stroke
	let strokeColor = '#000000';

	let itemWidth: null | string = null;
	let itemHeight: null | string = null;

	let gridSize = 20; // size of grid squares in pixels
	let exhibitionName: undefined | string = undefined;

	let images: SeatImageItemModel[] = [];
	let files: any;
	let selectedObjectId: number = 0;

	let bottomRightRadius = 0;
	let bottomLeftRadius = 0;
	let topLeftRadius = 0;
	let topRightRadius = 0;
	let isAddingText = false;
	let objects: any[] = [];

	let objectDetail: {
		selectable: boolean;
		services: seatServicesModel[];
		price: number;
	} = {
		selectable: false,
		services: [],
		price: 0
	};
	let isAnObjectSelected = false;

	// Function to update layers
	const updateLayers = () => {
		objects = canvas
			.getObjects()
			.filter((object: any) => !(object.type !== 'group' && object.groupId !== undefined))
			.map((object: any, index: number) => {
				if (object.type === 'group') {
					// This object is a group, add group-specific information
					return {
						id: object.id,
						icon: object.icon,
						type: object.type,
						isGroup: true,
						children: object._objects.map((child: any, childIndex: number) => {
							return {
								id: childIndex,
								type: child.type
							};
						})
					};
				} else {
					return {
						icon: object.icon,
						id: object.id,
						type: object.type,
						isGroup: false
					};
				}
			});
		const el = document.getElementById('layers');
		const sortable = Sortable.create(el, {
			onEnd: (evt: any) => {
				const id = evt.item.dataset.id;
				const object = canvas.getObjects().find((obj: any) => obj.id == id);
				if (object) {
					// Subtract the number of higher-indexed objects from the new index to get the correct index in the canvas._objects array
					let newIndex = canvas.getObjects().length - evt.newIndex - 1;
					// Ensure index is within array bounds.
					newIndex = Math.max(0, Math.min(newIndex, canvas.getObjects().length - 1));
					// Move the object to the new position.

					object.moveTo(newIndex);
					// Rerender canvas.
					canvas.renderAll();
					// Update the layers in the UI.
					// updateLayers();
				}
			}
		});
	};

	$: {
		images = $seatImageItemStore;
	}
	const adjustCanvasSize = () => {
		if (canvas) {
			canvas.setDimensions({
				width: container.offsetWidth,
				height: container.offsetHeight
			});
			console.log(container.offsetWidth / container.offsetHeight);
			// Create a rectangle with no fill, only a stroke (border)
			// Create a rectangle with no fill, only a stroke (border)
		}
	};

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

	onMount(async () => {
		seatImageItemStore.getAllSeatItems();
		await getSeatServices(data.supabase, 1, 15);
		// var customRect = createCustomRectangle();

		canvas = new Seat.fabric.Canvas('canvas', { isDrawingMode: false });
		canvas.on('path:created', (e: any) => {
			let path = e.path;
			path.set({ stroke: 'red' });

			// canvas.isDrawingMode = false;
			canvas.renderAll();

			// You can save `path` to a database here, if you want
		});

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
					exhibitionName = data.name;
					const design = data.design;
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
					const prevCanvasWidth = design.width;
					const prevCanvasHeight = design.height;

					const prevCanvasRatio = prevCanvasWidth / prevCanvasHeight;

					const newCanvasHeight = container.offsetWidth / prevCanvasRatio;
					canvas.setWidth(container.offsetHeight);

					canvas.setHeight(newCanvasHeight);
					canvas.renderAll();
					// Ensure the border always stays in the back of other objects
				});
		}

		// Handle object removed
		canvas.on('object:removed', () => {
			updateLayers();
		});
		updateLayers();
		canvas.on('object:moving', function (options: Seat.fabric.IEvent) {
			// if (options.target) {
			// 	options.target.set({
			// 		left: Math.round(options.target.left! / gridSize) * gridSize,
			// 		top: Math.round(options.target.top! / gridSize) * gridSize
			// 	});
			// }
		});
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
		let liveLine: any | null = null;
		canvas.on('mouse:down', function (options: any) {
			let pointer = canvas.getPointer(options.e);
			if (isAddingText) {
				const text = new Seat.fabric.IText('Click to edit text', {
					left: pointer.x,
					top: pointer.y,
					fontSize: 20,
					fill: 'black'
				});

				canvas.add(text);
				isAddingText = false;
			}
			if (isDrawing) {
				points.push({ x: pointer.x, y: pointer.y });

				liveLine = new Seat.fabric.Line(
					[points[points.length - 1].x, points[points.length - 1].y, pointer.x, pointer.y],
					{
						stroke: 'red',
						strokeWidth: 1,
						selectable: false
					}
				);
				liveLine['id'] = new Date().getTime();
				canvas.add(liveLine);
				lines.push(liveLine);

				if (
					points.length > 2 &&
					Math.abs(points[0].x - points[points.length - 1].x) < 50 &&
					Math.abs(points[0].y - points[points.length - 1].y) < 50
				) {
					points[points.length - 1] = points[0];

					// Close the shape
					let polygon: any = new Seat.fabric.Polygon(points, {
						stroke: 'red',
						fill: 'transparent',
						strokeWidth: 1,
						selectable: true
					});
					polygon['id'] = new Date().getTime();
					canvas.add(polygon);
					canvas.renderAll(); // You might need to request a re-render of the canvas

					// Reset
					isDrawing = false;
					points = [];

					// Remove temporary lines
					for (let line of lines) {
						canvas.remove(line);
					}
					lines = [];
					updateLayers();
				}
			}

			if (spacePressed) {
				panning = true;
				lastPosX = options.e.clientX;
				lastPosY = options.e.clientY;
			}
		});

		canvas.on('mouse:move', function (opt: any) {
			if (isDown || isDrawing) {
				let pointer = canvas.getPointer(opt.e);
				const mouseX = pointer.x;
				const mouseY = pointer.y;
				if (points.length === 0) return;
				const x = points[points.length - 1].x;
				const y = points[points.length - 1].y;
				if (liveLine) {
					liveLine.set({ x2: pointer.x, y2: pointer.y, x1: x, y1: y });
					canvas.renderAll();
				}
			}

			if (panning && spacePressed) {
				var delta = new Seat.fabric.Point(opt.e.clientX - lastPosX, opt.e.clientY - lastPosY);
				canvas.relativePan(delta);
				lastPosX = opt.e.clientX;
				lastPosY = opt.e.clientY;
			}
		});

		canvas.on('mouse:up', function (options: any) {
			if (isDrawing) {
				isDown = false;
			}

			panning = false;
			spacePressed = false;
		});

		// Add an event listener to your group button
		document.getElementById('group-button')?.addEventListener('click', () => {
			let activeObjects = canvas.getActiveObjects();
			if (activeObjects.length > 0) {
				let group = new Seat.fabric.Group(activeObjects, {
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
			const index = canvas.getObjects().indexOf(selectedObject);
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
			onObjectModified(modifiedObject);
		});

		window.addEventListener('keydown', function (e) {
			// keyCode 46 corresponds to the Delete key
			const selectedObject = canvas.getActiveObject();
			if (e.key === 'Delete' || e.key === 'Backspace') {
				removeSelectedObject();
			}
			handleKeydown(e, selectedObject);
		});
	});

	function handleKeydown(event: any, selectedObject: any) {
		let movingPixel = 1;
		if (event.shiftKey) movingPixel = 10;
		switch (event.code) {
			case 'ArrowUp':
				selectedObject.top -= movingPixel;
				break;
			case 'ArrowDown':
				selectedObject.top += movingPixel;
				break;
			case 'ArrowLeft':
				selectedObject.left -= movingPixel;
				break;
			case 'ArrowRight':
				selectedObject.left += movingPixel;
				break;
		}
		canvas.renderAll(); // Render changes
	}
	function clearAllInput() {
		strokeWidth = null;
		itemWidth = null;
		itemHeight = null;
		isAnObjectSelected = false;
		selectedObjectId = 0;
	}

	function onObjectModified(selectedObject: any) {
		// selectedObject.setCoords(); // Update object's coordinates after modifications
		// if()
		if (selectedObject.scaleX !== 1 || selectedObject.scaleY !== 1) {
			itemWidth = selectedObject.getScaledWidth();
			itemHeight = selectedObject.getScaledHeight();
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
		selectedObjectId = selectedObject?.id;
		strokeColor = selectedObject.stroke;
		strokeWidth = selectedObject.strokeWidth;
		fillColor = selectedObject.fill;
		itemWidth = selectedObject.width;
		itemHeight = selectedObject.height;
		isAnObjectSelected = true;
		// canvas.bringToFront(selectedObject);
	}

	async function openAddSeatModal() {
		addSeatModal = true;
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

	// Function to enable text adding mode
	const enableTextMode = () => {
		canvas.isDrawingMode = false;
		isDrawing = false;
		isAddingText = !isAddingText;
	};

	function onPenSelect() {
		isDrawing = false;
		isAddingText = false;
		canvas.isDrawingMode = !canvas.isDrawingMode;
		canvas.freeDrawingBrush.width = 5;
		canvas.freeDrawingBrush.color = 'red';
	}

	function onDrawLine() {
		canvas.isDrawingMode = false;
		isAddingText = false;
		isDrawing = !isDrawing;
	}

	function selectEditingMode(modeType: EditingMode) {
		switch (modeType) {
			case EditingMode.Draw:
				onPenSelect();
				break;
			case EditingMode.Text:
				enableTextMode();
				break;
			case EditingMode.Line:
				onDrawLine();
				break;
		}
	}
	function addPropertiesToShape() {
		let selectedObject = canvas.getActiveObject();
		selectedObject.set({
			selectable: !objectDetail.selectable
		});
		objectDetail.selectable = !objectDetail.selectable;
		canvas.requestRenderAll();
	}
	function addServiceToActiveObject(service: seatServicesModel) {
		let selectedObject = canvas.getActiveObject();
		let index = objectDetail.services.findIndex((item) => item.id === service.id);
		if (index === -1) {
			objectDetail.services.push(service);
		} else {
			objectDetail.services.splice(index, 1);
		}
		objectDetail = { ...objectDetail };
		selectedObject.set({
			objectDetail: objectDetail
		});
		canvas.requestRenderAll();
	}
	function addFreeService(event: Event, service: seatServicesModel) {
		event.stopPropagation();
		let selectedObject = canvas.getActiveObject();
		let selectedService = selectedObject.objectDetail?.services.find(
			(item: any) => item.id === service.id
		);
		selectedService.unlimitedFree = !selectedService.unlimitedFree;

		objectDetail = { ...selectedObject.objectDetail };
	}
	function addMaxFreeServiceCount(event: any, service: seatServicesModel) {
		event.stopPropagation();
		let selectedObject = canvas.getActiveObject();
		let selectedService = selectedObject?.objectDetail?.services.find(
			(item: any) => item.id === service.id
		);
		if (selectedService) {
			selectedService.maxFreeCount = +event.target?.value;
		}

		objectDetail = { ...selectedObject?.objectDetail };
	}
	function addMaxServiceCount(event: any, service: seatServicesModel) {
		event.stopPropagation();
		let selectedObject = canvas.getActiveObject();
		let selectedService = selectedObject.objectDetail?.services.find(
			(item: any) => item.id === service.id
		);
		selectedService.maxQuantityPerUser = +event.target?.value;

		objectDetail = { ...selectedObject.objectDetail };
	}

	function copySelectedObject() {
		const selectedObject = canvas.getActiveObject();

		if (selectedObject) {
			const copiedObject = Seat.fabric?.util.object.clone(selectedObject);
			copiedObject.set({
				left: selectedObject.left + 10,
				top: selectedObject.top + 10
			});

			canvas.copiedObject = copiedObject;
		}
	}

	function pasteCopiedObject() {
		if (canvas.copiedObject) {
			const pastedObject = Seat.fabric?.util.object.clone(canvas.copiedObject);
			pastedObject.set({
				id: new Date().getTime()
			});
			canvas.add(pastedObject);
			canvas.setActiveObject(pastedObject);
			canvas.renderAll();
			updateLayers();
		}
	}
	$: {
		if (objectDetail && canvas) {
			let selectedObject = canvas?.getActiveObject();
			if (selectedObject) {
				selectedObject.set({
					objectDetail: objectDetail
				});
				canvas.renderAll();
			}
		}
	}
	function addDescriptionToObjectDetail(description: any, lang: string) {
		let selectedObject = canvas?.getActiveObject();
		if (!selectedObject.objectDetail.descriptionLanguages) {
			selectedObject.objectDetail.descriptionLanguages = [];
		}
		selectedObject.objectDetail.descriptionLanguages =
			selectedObject.objectDetail.descriptionLanguages.filter((x: any) => x.language !== lang);
		selectedObject.objectDetail.descriptionLanguages.push({
			description: description.value,
			language: lang as LanguageEnum
		});
		objectDetailDescription = selectedObject.objectDetail.descriptionLanguages;
	}

	async function getFavColors() {
		await data.supabase
			.from('fav_colors')
			.select('*')
			.then((Response) => {
				favColors = Response.data?.map((x) => x.color) as string[];
			});
	}

	let newFavColor: string = '';
	let addFavColorLoading = false;
	async function addNewFavColor() {
		if (!newFavColor) return;
		if (!newFavColor.startsWith('#')) {
			newFavColor = `#${newFavColor}`;
		}
		addFavColorLoading = true;
		await data.supabase.from('fav_colors').insert([{ color: newFavColor }]);
		await getFavColors();
		newFavColor = '';
		addFavColorLoading = false;
	}
</script>

{#if Seat.fabric}
	<TopBarComponent
		data={{
			fillColor: fillColor,
			strokeColor: strokeColor,
			canvas: canvas,
			isDrawing: isDrawing,
			isAddingText: isAddingText,
			container: container
		}}
		on:toggleDrawingMode={(e) => selectEditingMode(e.detail.type)}
		on:updateLayers={() => updateLayers()}
		on:openAddSeatModal={() => openAddSeatModal()}
	/>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<Modal bind:open={addSeatModal} size="lg" autoclose={false} class="w-full min-h-[300px]">
		<AddSeatModalComponent
			{data}
			seatInfo={{
				canvas: canvas,
				seatId: $page.params.seatId
			}}
			on:closeModal={() => (addSeatModal = false)}
			{currentSeatLayoutData}
		/>
	</Modal>
	<div class="flex flex-col w-full h-full flex-1">
		<div class="w-full grid grid-cols-6 h-full">
			<DrawingBar
				data={{
					canvas: canvas,
					files: files,
					objects: objects,
					selectedObjectId: selectedObjectId,
					fabric: Seat.fabric
				}}
				on:updateLayers={() => updateLayers()}
			/>

		<div bind:this={container} class="w-full col-span-4 relative overflow-hidden">
			<canvas id="canvas" />
			<div class="absolute bottom-10 right-10 w-40 flex justify-between">
				<Button on:click={zoomIn} pill={true} outline={true} class="w-full1"><Plus /></Button>
				<Button on:click={zoomOut} pill={true} outline={true} class="w-full1"><Minus /></Button>
			</div>
		</div>
		<div class="p-4 bg-secondary">
			{#if canvas && isAnObjectSelected}
				<div class="pb-4 w-full">
					<Button on:click={addPropertiesToShape} class="w-full" outline>
						<Checkbox checked={objectDetail.selectable} />

						selectable
					</Button>
				</div>
			{/if}

			<input type="color" id="color-picker" bind:value={fillColor} on:input={updateFillColor} />
			<div class="grid grid-cols-2 gap-4 my-4">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>W</InputAddon><Input
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
					<InputAddon>H</InputAddon><Input
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
				<div class="flex col-span-2">
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
			{#if objectDetail.selectable}
				<div class="w-full">
					<ButtonGroup class="w-full mb-2" size="sm">
						<InputAddon>Price</InputAddon><Input
							type="number"
							size="sm"
							placeholder="select price"
							bind:value={objectDetail.price}
						/></ButtonGroup
					>
					<Button id="placements" class="w-full"><Chevron>Services</Chevron></Button>
					<Dropdown class="overflow-y-auto px-3 pb-3 text-sm mx-3 ">
						<div slot="header" class="p-3">
							<Search size="md" />
						</div>
						{#if $seatServices}
							{#each $seatServices as service}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
								<li
									class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
									on:click={() => {
										addServiceToActiveObject(service);
									}}
								>
									{#if service.seat_services_languages}
										<div class="flex justify-between">
											<Checkbox
												disabled={true}
												class="cursor-pointer"
												checked={objectDetail.services.some((x) => x.id === service.id)}
												>{service.seat_services_languages[0].title}</Checkbox
											>

											<img
												src={getImage(service.icon)}
												class="w-8 h-8 rounded-full mr-3"
												alt="niaaaa"
											/>
										</div>
									{/if}
								</li>
							{/each}
						{/if}
					</Dropdown>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
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
