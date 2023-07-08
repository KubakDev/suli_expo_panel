<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import { fabric } from 'fabric';
	import type { PageData } from '../$types';
	import {
		Button,
		ButtonGroup,
		Checkbox,
		Chevron,
		Dropdown,
		DropdownItem,
		Dropzone,
		Helper,
		Input,
		InputAddon,
		Label,
		Modal,
		Search,
		Spinner
	} from 'flowbite-svelte';
	import { ChatBubbleBottomCenter, Minus, Pencil, Plus, PlusCircle, Signal } from 'svelte-heros-v2';
	import { canvasToDataUrl, canvasToFile } from '$lib/utils/canva_to_image';
	import type { SeatImageItemModel } from '../../../../stores/seatImageItemStore';
	import { alertStore } from '../../../../stores/alertStore';
	import seatImageItemStore from '../../../../stores/seatImageItemStore';
	import uploadFileStore from '../../../../stores/uploadFileStore';
	import { page } from '$app/stores';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { getSeatServices, seatServices } from '../../../../stores/seatServicesStore';
	import Sortable from 'sortablejs';
	import { EditingMode } from '../../../../models/editingModeModel';
	import { getImage } from '$lib/utils/getImage';
	import type { seatServicesModel } from '../../../../models/seatServicesModel';
	import AddSeatModalComponent from '../../../../lib/components/seat/addSeat.svelte';

	let iconCanvas = new fabric.StaticCanvas('');
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

	let isDrawing = false; // Whether the mouse is down
	let originX;
	let originY;
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
	let exhibitionName: undefined | string = undefined;
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
	class MyGroup extends fabric.Group {
		groupId: number;

		constructor(items: fabric.Object[], options: fabric.IGroupOptions = {}) {
			super(items, options);
			this.groupId = options.groupId;
		}
	}

	class MyObject extends fabric.Object {
		groupId: number;
	}

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
				console.log('id ', id);
				const object = canvas.getObjects().find((obj: any) => obj.id == id);
				if (object) {
					// Subtract the number of higher-indexed objects from the new index to get the correct index in the canvas._objects array
					let newIndex = canvas.getObjects().length - evt.newIndex - 1;
					// Ensure index is within array bounds.
					newIndex = Math.max(0, Math.min(newIndex, canvas.getObjects().length - 1));
					// Move the object to the new position.
					console.log('newIndex ', newIndex);
					object.moveTo(newIndex);
					console.log('object ', object);
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
		console.log('adjustCanvasSize ', container.offsetWidth);
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

	onMount(async () => {
		seatImageItemStore.getAllSeatItems();
		await getSeatServices(data.supabase, 1, 15);
		// var customRect = createCustomRectangle();

		canvas = new fabric.Canvas('canvas', { isDrawingMode: false });
		adjustCanvasSize();
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
					console.log(data);
					if (data && data['design']) {
						await canvas.loadFromJSON(data['design'], canvas.renderAll.bind(canvas));
					}

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

		// if (typeof window !== 'undefined') {
		// 	window.addEventListener('resize', adjustCanvasSize);
		// 	adjustCanvasSize();
		// }

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
		let liveLine: any | null = null;
		canvas.on('mouse:down', function (options: any) {
			let pointer = canvas.getPointer(options.e);
			if (isAddingText) {
				const text = new fabric.IText('Click to edit text', {
					left: pointer.x,
					top: pointer.y,
					fontSize: 20,
					fill: 'black'
				});

				canvas.add(text);
				isAddingText = false;
			}
			if (isDrawing) {
				console.log('mouse down');

				points.push({ x: pointer.x, y: pointer.y });

				// Draw a line from the last point to this point

				liveLine = new fabric.Line(
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
					let polygon: any = new fabric.Polygon(points, {
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
						console.log('removing line');
						canvas.remove(line);
					}
					lines = [];
					updateLayers();
				}
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
				var delta = new fabric.Point(opt.e.clientX - lastPosX, opt.e.clientY - lastPosY);
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
			const index = canvas.getObjects().indexOf(selectedObject);
			console.log("The object's layer order is", index);
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
			const selectedObject = canvas.getActiveObject();
			console.log(e);
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
		console.log(selectedObject);
		canvas.renderAll(); // Render changes
	}
	function clearAllInput() {
		strokeWidth = null;
		itemWidth = null;
		itemHeight = null;
		isAnObjectSelected = false;
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
		console.log('else');
	}

	function setSelectedObjectValue(selectedObject: any) {
		strokeColor = selectedObject.stroke;
		strokeWidth = selectedObject.strokeWidth;
		fillColor = selectedObject.fill;
		itemWidth = selectedObject.width;
		itemHeight = selectedObject.height;
		isAnObjectSelected = true;
		// canvas.bringToFront(selectedObject);
	}

	async function convetToObject() {
		addSeatModal = true;
		// let json = canvas.toObject([
		// 	'left',
		// 	'top',
		// 	'width',
		// 	'height',
		// 	'fill',
		// 	'id',
		// 	'stroke',
		// 	'strokeWidth',
		// 	'icon',
		// 	'selectable',
		// 	'objectDetail'
		// ]);
		// const supabase = data.supabase;
		// console.log(json);
		// const randomImageName = getRandomTextNumber();
		// const canvasImage = await canvasToFile(canvas, randomImageName);
		// //upload canvas image to supabase storage
		// const fileResult = await supabase.storage
		// 	.from('image')
		// 	.upload(`seats_layout/${canvasImage.name}`, canvasImage);
		// console.log(fileResult.data);
		// if (!fileResult.data) {
		// 	alertStore.addAlert('error', 'Could not convert canvas to image', 'error');
		// 	return;
		// }

		// const seatId = $page.params.seatId;
		// if (seatId !== 'create') {
		// 	const result = await supabase
		// 		.from('seat_layout ')
		// 		.update([
		// 			{
		// 				name: 'text',
		// 				design: json,
		// 				is_active: true,
		// 				exhibition: 1,
		// 				image_url: fileResult.data.path
		// 			}
		// 		])
		// 		.eq('id', seatId)
		// 		.then((res) => {
		// 			console.log(res);
		// 		});
		// } else {
		// 	const result = await supabase
		// 		.from('seat_layout ')
		// 		.insert([
		// 			{
		// 				name: 'text',
		// 				design: json,
		// 				is_active: true,
		// 				exhibition: 74,
		// 				image_url: fileResult.data.path
		// 			}
		// 		])
		// 		.then((res) => {
		// 			console.log(res);
		// 		});
		// }
	}

	function addImages() {
		// alertStore.addAlert('error', 'Error', 'error');
		uploadImageModal = true;
	}

	function onShapeSelected(image: SeatImageItemModel | null = null) {
		let iconCanvas = new fabric.StaticCanvas(null);
		iconCanvas.setWidth(50);
		iconCanvas.setHeight(50);

		fabric.Image.fromURL(
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
				const newImg = new fabric.Image(img.getElement(), {
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

				canvas.add(img);
				canvas.renderAll();
				updateLayers();
			},
			{ crossOrigin: 'anonymous' }
		);
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
		console.log('create new Item');
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

	function groupObjects() {
		let activeObjects = canvas.getActiveObjects();
		if (activeObjects) {
			console.log(activeObjects);

			canvas.discardActiveObject();
			const group = new MyGroup(activeObjects, { groupId: Date.now() });
			group._objects.forEach((obj: any) => {
				obj.groupId = group.groupId; // Add groupId to each object
			});
			canvas.add(group);
			canvas.requestRenderAll();
		}
	}

	function unGroupObjects() {
		let group = canvas.getActiveObject();
		if (group.type === 'group') {
			// Ungroup

			group.destroy();
			canvas.remove(group);
			// group.forEach(function (item: any) {
			// 	item.groupId = undefined;
			// 	item.set('dirty', true);
			// });

			// make groupId for each object undefined
			//
			group.forEachObject(function (obj: any) {
				console.log(obj);
				obj.groupId = undefined;
			});
			group.groupId = undefined;
			canvas.add.apply(canvas, group);
			canvas.renderAll();
			updateLayers();
		}
	}

	function selectImageForBackground() {
		let input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = (event: any) => {
			let file = event.target.files[0];
			let reader = new FileReader();
			reader.onload = (event: any) => {
				let imgObj = new Image();
				imgObj.src = event.target.result;
				imgObj.onload = () => {
					let image = new fabric.Image(imgObj);
					image.set({
						left: 0,
						top: 0,
						angle: 0,
						padding: 10
					});
					// set to object to null
					// image.toObject() = () => null;
					//image.scale(getRandomNum(0.1, 0.25)).setCoords();
					const containerWidth = container.offsetWidth;

					const imageRatio = image.width! / image.height!;

					// change canvas size to fit container
					canvas.setWidth(containerWidth);

					// set image height to respect ratio

					const canvasHeight = containerWidth / imageRatio;

					canvas.setHeight(canvasHeight);

					canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas), {
						scaleX: canvas.width / image!.width!,
						scaleY: canvas.height / image!.height!
					});
				};
			};
			reader.readAsDataURL(file);
		};
		input.click();
	}

	function toggleBackgroundImage() {
		// hide and show background image
		let image = canvas.backgroundImage;
		if (image) {
			image.visible = !image.visible;
			canvas.renderAll();
		}
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
		console.log('add properties to shape');
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
</script>

<div class="flex flex-col w-full h-full flex-1">
	<div class="flex justify-between bg-secondary border-b border-gray-500 h-16">
		<div class="flex justify-between">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div on:click={() => createItem()} class="seat-design rounded cursor-move">Shape</div>
			<Button
				class="h-full border-none rounded-none"
				size="lg"
				color={canvas && canvas.isDrawingMode ? 'primary' : 'none'}
			>
				<Pencil
					on:click={() => selectEditingMode(EditingMode.Draw)}
					size="30"
					class="text-white  outline-none"
				/>
			</Button>
			<Button
				class="h-full border-none rounded-none"
				size="lg"
				color={isDrawing ? 'primary' : 'none'}
			>
				<Pencil
					on:click={() => selectEditingMode(EditingMode.Line)}
					size="30"
					class=" text-white dark:text-green-700 outline-none "
				/>
			</Button>
			<Button
				id="group-button"
				class="h-full border-none rounded-none"
				size="lg"
				color={isAddingText ? 'primary' : 'none'}
				on:click={() => selectEditingMode(EditingMode.Text)}
				><ChatBubbleBottomCenter color="white" /></Button
			>
		</div>
		<Button id="group-button" class="!p-2 mx-4 bg-red" size="lg" on:click={toggleBackgroundImage}
			>Toggle background</Button
		>
		<Button id="group-button" class="!p-2 mx-4 bg-red" size="lg" on:click={selectImageForBackground}
			>Add Image to background</Button
		>
		<!-- <ButtonGroup class="" size="sm">
			<InputAddon>Name</InputAddon><Input
				type="text"
				size="sm"
				bind:value={exhibitionName}
				placeholder="Name"
				let:props
			/></ButtonGroup
		> -->
		<Button
			id="group-button"
			class="!p-2 mx-4 bg-red"
			size="lg"
			color={isDrawing ? 'dark' : 'light'}
			on:click={convetToObject}>Save</Button
		>
		<Button
			id="group-button"
			class="!p-2 mx-4 bg-red"
			size="lg"
			color={isDrawing ? 'dark' : 'light'}
			on:click={groupObjects}>Group</Button
		>
		<Button
			id="group-button"
			class="!p-2 mx-4 bg-red"
			size="lg"
			color={isDrawing ? 'dark' : 'light'}
			on:click={unGroupObjects}>UnGroup</Button
		>
	</div>
	<div class="w-full grid grid-cols-6 h-full">
		<div class="flex flex-col p-4 bg-secondary">
			<div class="grid grid-cols-2 gap-2 rounded-md my-6">
				<Button on:click={() => addImages()} class="w-20 h-20 seat-design   rounded cursor-move ">
					<Plus class="w-full h-full" />
				</Button>
				{#each images as image, index}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						on:click={() => onShapeSelected(image)}
						class="w-full h-20 seat-design rounded cursor-move"
					>
						<img class="w-full h-full object-cover" src={image.image_url} alt={image.name} />
					</div>
				{/each}
			</div>
			<Modal bind:open={addSeatModal} size="sm" autoclose={false} class="w-full">
				<AddSeatModalComponent
					{data}
					seatInfo={{
						canvas: canvas,
						seatId:$page.params.seatId
					}}
				/>
			</Modal>
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
			<div class="mt-4">
				<div class="text-white text-xl my-4">Layers</div>
				<ul id="layers" style="height: 30vh " class="overflow-y-auto">
					{#each objects as object (object.id)}
						<li
							data-id={object.id}
							class="layer mb-2 p-1 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 flex justify-start items-center {object.isGroup
								? 'bg-blue-50'
								: 'bg-gray-50'}"
						>
							<img src={object.icon} alt="Object icon" class="object-icon w-8 h-8" />
							<div class="w-2 h-full" />
							<span>{object.type}</span>
							{#if object.isGroup}
								<ul class="ml-4">
									{#each object.children as child (child.id)}
										<li
											data-id={child.id}
											class="layer mb-2 p-2 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 bg-gray-50"
										>
											<span>{child.type} {child.id + 1}</span>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</div>
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
