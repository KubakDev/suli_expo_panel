<script lang="ts">
	// import { fabric } from "fabric";
	import { onMount, tick } from 'svelte';
	import type { PageData } from '../$types';
	import {
		Button,
		ButtonGroup, 
		Input,
		InputAddon,
		Modal,
		Spinner,
		TabItem,
		Tabs,
		Textarea,
		Select
	} from 'flowbite-svelte';
	import {  Plus } from 'svelte-heros-v2';
	import type { SeatImageItemModel } from '../../../../stores/seatImageItemStore';
	import seatImageItemStore from '../../../../stores/seatImageItemStore';
	import { page } from '$app/stores';
	import { getSeatServices, seatServices } from '../../../../stores/seatServicesStore';
	// @ts-ignore
	import Sortable from 'sortablejs';
	import { EditingMode } from '../../../../models/editingModeModel';
	import type { seatServicesModel } from '../../../../models/seatServicesModel';
	import AddSeatModalComponent from '../../../../lib/components/seat/addSeat.svelte';
	import TopBarComponent from '$lib/components/seat/topbar.svelte';
	import DrawingBar from '$lib/components/seat/drawingBar.svelte';
	import { LanguageEnum } from '../../../../models/languageEnum';

	let languageEnumKeys = Object.values(LanguageEnum);
	let spacePressed = false;
	let fabric: any = null;
	let addSeatModal = false;

	let currentSeatLayoutData: any = {};
	export let data: PageData;
	let canvas: any = null;
	let container: any;
	let fillColor = '#000000'; // Default color
	let favColors: string[] = [];

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

	let radius: null | undefined | number = null;
	let isAddingText = false;
	let objects: any[] = [];

	let objectDetailDescription: { language?: LanguageEnum; description?: string }[] = [];

	let objectDetail: {
		selectable: boolean;
		services: { id: number; unlimitedFree: boolean }[];
		price: number;
		description?: string;
	} = {
		selectable: false,
		services: [],
		price: 0
	};
	let isAnObjectSelected = false;

	// Update these constants for canvas size options
	let CANVAS_WIDTH = 800;
	let CANVAS_HEIGHT = 600;
	let canvasSize = '800x600';


	const allowedSizes = [
		{ value: '800x600', name: '800 x 600' },
		{ value: '1024x768', name: '1024 x 768' },
		{ value: '1280x720', name: '1280 x 720' },
		{ value: '1366x768', name: '1366 x 768' },
		{ value: '1440x900', name: '1440 x 900' },
		{ value: 'custom', name: 'Custom' }
	];

	// Function to update canvas size
	function updateCanvasSize() {
		if (!canvas) return;

		let newWidth, newHeight;

		if (canvasSize === 'custom') {
			newWidth = CANVAS_WIDTH;
			newHeight = CANVAS_HEIGHT;
		} else {
			[newWidth, newHeight] = canvasSize.split('x').map(Number);
			CANVAS_WIDTH = newWidth;
			CANVAS_HEIGHT = newHeight;
		}

		// Update canvas dimensions
		canvas.setWidth(newWidth);
		canvas.setHeight(newHeight);
		
		// Update container dimensions
		if (container) {
			container.style.width = `${newWidth}px`;
			container.style.height = `${newHeight}px`;
		}

		// Ensure all objects stay within bounds
		canvas.getObjects().forEach((obj: any) => {
			if (obj.left + obj.width * obj.scaleX > newWidth) {
				obj.left = newWidth - obj.width * obj.scaleX;
			}
			if (obj.top + obj.height * obj.scaleY > newHeight) {
				obj.top = newHeight - obj.height * obj.scaleY;
			}
			obj.setCoords();
		});

		// Maintain white background
		canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
		canvas.requestRenderAll();
	}

	// Add this function before onMount
	function updateCanvasDimensions() {
		if (!canvas) return;
		
		// Get the container dimensions
		const containerWidth = container?.offsetWidth || CANVAS_WIDTH;
		const containerHeight = container?.offsetHeight || CANVAS_HEIGHT;
		
		// Update canvas dimensions
		canvas.setDimensions({
			width: containerWidth,
			height: containerHeight
		});
		
		// Ensure all objects stay within bounds
		canvas.getObjects().forEach((obj: any) => {
			if (obj.left + obj.width * obj.scaleX > containerWidth) {
				obj.left = containerWidth - obj.width * obj.scaleX;
			}
			if (obj.top + obj.height * obj.scaleY > containerHeight) {
				obj.top = containerHeight - obj.height * obj.scaleY;
			}
			obj.setCoords();
		});
		
		canvas.renderAll();
	}

	// Function to update layers
	onMount(async () => {
		const fabricModule = await import('fabric');
		fabric = fabricModule.fabric;

		// Initialize canvas with white background
		canvas = new fabric.Canvas('canvas', {
			backgroundColor: 'transparent',
			width: CANVAS_WIDTH,
			height: CANVAS_HEIGHT,
			allowTouchScrolling: true,
			selection: true,
			preserveObjectStacking: true,
			// Disable zoom
			allowZoom: false,
			zoomOnScroll: false,
			zoomOnPinch: false
		});

		// Set initial canvas properties
		canvas.setBackgroundColor('transparent', canvas.renderAll.bind(canvas));
		
		// Add event listener for object added
		canvas.on('object:added', function(e) {
			const obj = e.target;
			if (obj) {
				// Ensure object is visible and properly positioned
				obj.setCoords();
				canvas.renderAll();
			}
		});

		// Add event listener for window resize
		window.addEventListener('resize', () => {
			updateCanvasSize();
		});

		await getFavColors();

		seatImageItemStore.getAllSeatItems();
		const x = await getSeatServices(data.supabase);
		updateCanvasDimensions();
		
		canvas.imageSmoothingEnabled = false;
		canvas.msImageSmoothingEnabled = false;
		canvas.lineWidth = Math.round(2);
		const supabase = data.supabase;

		const pageId = $page.params.seatId;
		if (pageId !== 'create') {
			let result = await supabase
				.from('seat_layout')
				.select('*,exhibition(*,exhibition_languages(*)),seat_privacy_policy_lang(*)')
				.eq('id', pageId)
				.single()
				.then(async (result) => {
					const data: any = result.data;
					currentSeatLayoutData = data;
					exhibitionName = data.name;
					const design = data.design;

					// Set the canvas size from the design data
					if (design?.width && design?.height) {
						const sizeString = `${design.width}x${design.height}`;
						// Check if this size exists in allowedSizes
						const existingSize = allowedSizes.find(size => size.value === sizeString);
						if (existingSize) {
							canvasSize = existingSize.value;
						} else {
							// If size doesn't exist in allowedSizes, add it
							allowedSizes.push({ value: sizeString, name: `${design.width} x ${design.height}` });
							canvasSize = sizeString;
						}
						
						// Update canvas dimensions
						if (canvas) {
							canvas.setDimensions({
								width: design.width,
								height: design.height
							});
						}
					}

					await canvas.loadFromJSON(design, async () => {
						// Ensure background image is loaded first
						if (canvas.backgroundImage) {
							// Set background image to exact canvas dimensions
							canvas.backgroundImage.scaleToWidth(design.width);
							canvas.backgroundImage.scaleToHeight(design.height);
							canvas.backgroundImage.set({
								originX: 'left',
								originY: 'top',
								left: 0,
								top: 0
							});
						}

						// Now handle all objects
						canvas.getObjects().forEach((obj: any) => {
							// Preserve original coordinates
							if (obj !== canvas.backgroundImage) {
								obj.set({
									left: obj.left,
									top: obj.top,
									scaleX: obj.scaleX,
									scaleY: obj.scaleY
								});
								obj.setCoords();
							}
						});

						// Record initial state after loading
						recordInitialState();
						
						await tick();
						getData();
						canvas.requestRenderAll();
					});

					// Don't scale or center the viewport - keep original positioning
					canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
					canvas.renderAll();
				});
		} else {
			// For new canvas creation
			if (canvas) {
				canvas.setDimensions({
					width: CANVAS_WIDTH,
					height: CANVAS_HEIGHT
				});
			}
			recordInitialState();
		}

		// Ensure objects maintain position relative to background when moving
		canvas.on('object:moving', function(e) {
			const obj = e.target;
			// Get object boundaries
			const objBounds = obj.getBoundingRect();
			
			// Keep objects within the canvas/background image boundaries
			const maxWidth = canvas.width;
			const maxHeight = canvas.height;

			if (objBounds.left < 0) {
				obj.set('left', 0);
			}
			if (objBounds.top < 0) {
				obj.set('top', 0);
			}
			if (objBounds.left + objBounds.width > maxWidth) {
				obj.set('left', maxWidth - objBounds.width);
			}
			if (objBounds.top + objBounds.height > maxHeight) {
				obj.set('top', maxHeight - objBounds.height);
			}

			// Snap to grid if enabled
			if (gridSize) {
				obj.set({
					left: Math.round(obj.left / gridSize) * gridSize,
					top: Math.round(obj.top / gridSize) * gridSize
				});
			}
		});

		// Save the exact state when saving
		async function saveCanvas() {
			const json = canvas.toJSON(['id', 'objectDetail']);
			// Ensure we save the exact dimensions and positions
			json.width = canvas.width;
			json.height = canvas.height;
			return json;
		}

		// Handle object removed
		canvas.on('object:removed', () => {
			updateLayers();
		});
		updateLayers();
		canvas.on('object:moving', function (options: fabric.IEvent) {
			if (options.target) {
				// Manipulate z-index when moving objects to ensure they are displayed above the background
				let movingObject = options.target;
				movingObject && movingObject.set('z-index', new Date().getTime());
				options.target.set({
					left: Math.round(options.target.left! / gridSize) * gridSize,
					top: Math.round(options.target.top! / gridSize) * gridSize
				});
			}
		});
		var panning = false;
		var lastPosX: any, lastPosY: any;
		// let spacePressed = false; // state for tracking space key

		// Listen for space key down and up events on the window
		// give space between the text that added
		window.addEventListener('keydown', function (e) {
			if (e.ctrlKey && e.code === 'Space') {
				e.preventDefault();

				let activeObject = canvas.getActiveObject();
				// (i-text) it means it is an text object(, which means the user can edit its text content.)
				if (activeObject && activeObject.type === 'i-text') {
					// insert a space at the current cursor position
					let cursorPosition = activeObject.selectionStart;
					let newText = [
						activeObject.text.slice(0, cursorPosition),
						' ',
						activeObject.text.slice(cursorPosition)
					].join('');
					activeObject.text = newText;
					activeObject.setSelectionStart(cursorPosition + 1);
					activeObject.setSelectionEnd(cursorPosition + 1);
					canvas.renderAll();
				}
			}
		});
		window.addEventListener('keydown', function (e) {
			if (e.key === 'Alt') {
				e.preventDefault();
				spacePressed = true;
			}
		});

		window.addEventListener('keyup', function (e) {
			if (e.key === 'Alt') {
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
					fill: 'black',
					editable: true,
					id: new Date().getTime() // Adding a unique ID based on the current time
				});

				canvas.add(text);
				isAddingText = false;
			}
			if (isDrawing) {
				points.push({ x: pointer.x, y: pointer.y });

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
			updateLayers();
			canvas.renderAll();
			canvas.requestRenderAll();
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
			// spacePressed = false;
		});

		// Add an event listener to your group button
		document.getElementById('group-button')?.addEventListener('click', () => {
			let activeObjects = canvas.getActiveObjects();
			if (activeObjects.length > 0) {
				let group = new fabric.Group(activeObjects, {
					objectCaching: false
				});

				// Modify the position of each object to be relative to the group
				group._objects.forEach((object: any) => {
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

		// Improve zoom behavior
		// canvas.on('mouse:wheel', function(opt) {
		// 	const delta = opt.e.deltaY;
		// 	let zoom = canvas.getZoom();
		// 	
		// 	// Zoom with Ctrl + Mouse wheel
		// 	if (opt.e.ctrlKey || opt.e.metaKey) {
		// 		opt.e.preventDefault();
		// 		opt.e.stopPropagation();
		// 		
		// 		// Calculate new zoom level
		// 		zoom *= 0.999 ** delta;
		// 		zoom = Math.min(Math.max(0.1, zoom), 20); // Limit zoom range
		// 		
		// 		// Get mouse position relative to canvas
		// 		const pointer = canvas.getPointer(opt.e);
		// 		
		// 		// Calculate zoom point
		// 		const x = pointer.x;
		// 		const y = pointer.y;
		// 		
		// 		// Set zoom with point
		// 		canvas.zoomToPoint({ x, y }, zoom);
		// 	}
		// });

		canvas.on('selection:created', function (event: any) {
			if (!event.selected?.[0]) return;
			setSelectedObjectValue(event.selected[0]);
		});

		canvas.on('selection:updated', function (event: any) {
			if (!event.selected?.[0]) return;
			setSelectedObjectValue(event.selected[0]);
		});

		canvas.on('selection:cleared', function (event: any) {
			clearAllInput();
			radius = null;
		});
		recordCanvasState();
		canvas.on('object:modified', function (event: any) {
			const obj = event.target;
			if (obj) {
				recordCanvasState();
				updateLayers();
			}
		});

		window.addEventListener('keydown', function (e) {
			const selectedObject = canvas.getActiveObject();
			if (e.ctrlKey && e.key === 'Delete') {
				removeSelectedObject();
			}
		});

		window.addEventListener('keydown', (e) => {
			if (e.ctrlKey && e.code === 'KeyZ') {
				undoSelectedObject();
			} else if (e.ctrlKey && e.code === 'KeyY') {
				redoSelectedObject();
			}
		});

		//function for copy
		// Function for copying, including custom properties
		window.addEventListener('keydown', (e) => {
			if (e.ctrlKey && e.code === 'KeyC') {
				const activeObject = canvas.getActiveObject();
				if (activeObject && activeObject.objectDetail) {
					// Use the extend method to ensure all properties are copied
					activeObject.clone((cloned: any) => {
						copiedObject = fabric.util.object.extend(cloned, {
							objectDetail: JSON.parse(JSON.stringify(activeObject.objectDetail))
						});
					});
				}
			}
		});

		//function for paste
		window.addEventListener('keydown', (e) => {
			if (e.ctrlKey && e.code === 'KeyV') {
				if (copiedObject) {
					copiedObject.clone((clonedObj: any) => {
						canvas.discardActiveObject(); // Deselect current object
						clonedObj.set({
							left: clonedObj.left,
							top: clonedObj.top,
							evented: true,
							objectDetail: JSON.parse(JSON.stringify(copiedObject.objectDetail))
						});

						if (clonedObj.type === 'activeSelection') {
							clonedObj.canvas = canvas;
							clonedObj.forEachObject((obj) => {
								const uniqueId =
									new Date().getTime().toString() + Math.floor(Math.random() * 10000).toString();
								obj.set('id', uniqueId); // unique numeric ID for each object
								canvas.add(obj);
							});
							clonedObj.setCoords();
						} else {
							const uniqueId =
								new Date().getTime().toString() + Math.floor(Math.random() * 10000).toString();
							clonedObj.set('id', uniqueId); // unique numeric ID for single object
							canvas.add(clonedObj);
						}

						canvas.setActiveObject(clonedObj);

						// update layer
						updateLayers();
						canvas.requestRenderAll();
					});
				}
			}
		});

		//functio to handle arrow keys
		// Function to handle arrow keys for moving objects
		window.addEventListener('keydown', (e) => {
			const activeObject = canvas.getActiveObject();
			if (!activeObject) return; // Exit if no object is selected

			const moveStep = 1; // Adjust this value to change the movement increment

			// Determine the direction and apply the movement
			switch (e.key) {
				case 'ArrowLeft':
					activeObject.set('left', activeObject.left - moveStep);
					e.preventDefault(); // Prevent the default action (scroll / move caret)
					break;
				case 'ArrowRight':
					activeObject.set('left', activeObject.left + moveStep);
					e.preventDefault();
					break;
				case 'ArrowUp':
					activeObject.set('top', activeObject.top - moveStep);
					e.preventDefault();
					break;
				case 'ArrowDown':
					activeObject.set('top', activeObject.top + moveStep);
					e.preventDefault();
					break;
			}

			activeObject.setCoords(); // Recalculate object boundaries and controls
			canvas.requestRenderAll(); // Refresh canvas to reflect changes
		});

		// Create boundary rectangle
		const boundary = new fabric.Rect({
			width: CANVAS_WIDTH - 80, // 40px padding on each side
			height: CANVAS_HEIGHT - 80,
			left: 40,
			top: 40,
			fill: 'transparent',
			stroke: 'transparent', // Changed from '#333333' to 'transparent'
			strokeWidth: 0, // Changed from 3 to 0
			selectable: false,
			evented: false,
			name: 'boundary'
		});

		// Add boundary to canvas
		canvas.add(boundary);
		canvas.renderAll();

		// Update layers when objects are added/removed/modified
		canvas.on('object:added', updateLayers);
		canvas.on('object:removed', updateLayers);
		canvas.on('object:modified', updateLayers);

		// Handle selection
		canvas.on('selection:created', function(event: any) {
			const obj = event.target;
			if (obj) {
				objectDetail = obj.objectDetail || {
					selectable: false,
					services: [],
					price: 0
				};
				isAnObjectSelected = true;
				selectedObjectId = obj.id;
			}
		});

		canvas.on('selection:cleared', function() {
			isAnObjectSelected = false;
			selectedObjectId = 0;
			clearAllInput();
		});

		// Initialize layers
		updateLayers();

		// Remove or comment out zoom-related functions
		// function zoomIn() { ... }
		// function zoomOut() { ... }

		// If you have any keyboard shortcuts for zooming, remove those too
		window.addEventListener('keydown', function (e) {
			// Remove any Ctrl + '+' or Ctrl + '-' handlers
			if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-')) {
				e.preventDefault();
				return false;
			}
		});

		// Prevent browser default zoom
		window.addEventListener('wheel', function (e) {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				return false;
			}
		}, { passive: false });

		// Add initial canvas state to history after loading
		if ($page.params.seatId !== 'create') {
			// For existing layouts, record initial state after loading
			canvas.loadFromJSON(currentSeatLayoutData.design, () => {
				recordCanvasState();
				canvas.renderAll();
			});
		} else {
			// For new layouts, record empty canvas state
			recordCanvasState();
		}
	});

	function getData() {
		if (canvas) {
			objects = canvas.getObjects();
		}
	}

	let copiedObject: any = null;
	let history: any[] = [];
	let currentHistoryIndex = -1; // Changed to start at -1
	let initialObjects: any[] = []; // Store initial objects

	function recordInitialState() {
		// Record the initial objects when loading the design
		initialObjects = canvas.getObjects().map(obj => ({
			id: obj.id,
			type: obj.type
		}));
		// Record initial canvas state
		recordCanvasState();
	}

	function recordCanvasState() {
		// remove future states if we are in the middle of the history
		if (currentHistoryIndex < history.length - 1) {
			history = history.slice(0, currentHistoryIndex + 1);
		}
		
		// Save the current canvas state
		const canvasState = JSON.stringify(canvas.toJSON(['id', 'objectDetail']));
		history.push(canvasState);
		currentHistoryIndex++;
	}

	function undoSelectedObject() {
		if (currentHistoryIndex <= 0) return;
		
		currentHistoryIndex--;
		const previousState = JSON.parse(history[currentHistoryIndex]);
		
		canvas.loadFromJSON(previousState, () => {
			// Ensure initial objects remain visible
			canvas.getObjects().forEach((obj: any) => {
				const isInitialObject = initialObjects.some(initial => initial.id === obj.id);
				if (isInitialObject) {
					obj.visible = true;
				}
			});
			canvas.renderAll();
			updateLayers();
		});
	}

	function redoSelectedObject() {
		if (currentHistoryIndex >= history.length - 1) return;
		
		currentHistoryIndex++;
		const nextState = JSON.parse(history[currentHistoryIndex]);
		
		canvas.loadFromJSON(nextState, () => {
			canvas.renderAll();
			updateLayers();
		});
	}

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
		}
	};

	async function updateCustomRectangle() {
		var activeObject = canvas.getActiveObject();

		//update radius after grouping
		if (activeObject.type === 'group') {
			activeObject.forEachObject((obj: any) => {
				obj.set({ rx: radius, ry: radius });
			});
		}

		activeObject.set({
			rx: radius,
			ry: radius
		});

		canvas.requestRenderAll();
	}


	function clearAllInput() {
		strokeWidth = null;
		itemWidth = null;
		radius = null;
		itemHeight = null;
		isAnObjectSelected = false;
		objectDetail = {
			selectable: false,
			services: [],
			price: 0
		};
		selectedObjectId = 0;
		objectDetailDescription = [];
	}
	function onObjectModified(selectedObject: any) {
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
		
		// Initialize objectDetail from the selected object if it exists
		if (selectedObject.objectDetail) {
			objectDetail = { ...selectedObject.objectDetail };
		} else {
			// Set default objectDetail if none exists
			objectDetail = {
				selectable: false,
				services: [],
				price: 0,
				descriptionLanguages: []
			};
			// Initialize the objectDetail on the selected object
			selectedObject.set('objectDetail', objectDetail);
		}
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

		// Update the fill properties after grouping the objects
		if (selectedObject.type === 'group') {
			selectedObject.forEachObject((obj: any) => {
				obj.set({ fill: fillColor });
			});
		}
		selectedObject.set({
			fill: fillColor
		});

		// Trigger canvas rendering
		canvas.requestRenderAll();
	}

	function updateStrokeProperties() {
		let selectedObject = canvas.getActiveObject();

		// Update stroke Property for each object in the group
		if (selectedObject.type === 'group') {
			selectedObject.forEachObject((obj: any) => {
				obj.set({
					stroke: strokeColor,
					strokeWidth: strokeWidth != null ? parseInt(strokeWidth) : 0
				});
			});
		} else {
			selectedObject.set(
				{
					stroke: strokeColor,
					strokeWidth: strokeWidth != null ? parseInt(strokeWidth) : 0
				},
				{ silent: true }
			);
		}

		canvas.requestRenderAll();
	}

	function removeSelectedObject() {
		let activeObject = canvas.getActiveObject();
		if (activeObject) {
			try {
				if (activeObject && activeObject.type === 'activeSelection') {
					activeObject.forEachObject(function (obj) {
						const isInitialObject = initialObjects.some(initial => initial.id === obj.id);
						if (!isInitialObject) {
							canvas.remove(obj);
						}
					});
				} else {
					const isInitialObject = initialObjects.some(initial => initial.id === activeObject.id);
					if (!isInitialObject) {
						canvas.remove(activeObject);
					}
				}
				canvas.requestRenderAll();
				recordCanvasState(); // Record state after removal
			} catch (e) {}
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
		let selectedObject = canvas.getActiveObject();
		if (!selectedObject) return;

		// Toggle the selectable property
		objectDetail.selectable = !objectDetail.selectable;
		
		// Update the object's objectDetail
		selectedObject.set({
			objectDetail: { ...objectDetail }  // Create a new object to ensure reactivity
		});
		
		canvas.requestRenderAll();
	}
	function addServiceToActiveObject(service: seatServicesModel) {
		let selectedObject = canvas.getActiveObject();
		let index = objectDetail.services.findIndex((item) => item.id === service.id);
		if (index === -1) {
			objectDetail.services.push({
				id: service.id ?? 0,
				unlimitedFree: false
			});
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
	function getSelectedObjectServiceDetail(service: any) {
		return objectDetail.services.find((serviceDetail) => serviceDetail.id == service.id) as any;
	}

	$: isLoading = true;

	// Custom width/height change handlers
	function handleCustomWidthChange(event: any) {
		CANVAS_WIDTH = parseInt(event.target.value) || 800;
		updateCanvasSize();
	}

	function handleCustomHeightChange(event: any) {
		CANVAS_HEIGHT = parseInt(event.target.value) || 600;
		updateCanvasSize();
	}

	function addShape(type: string) {
		if (!canvas) return;

		const center = canvas.getCenter();
		
		// Common properties for all shapes
		const commonProps = {
			left: center.left,
			top: center.top,
			fill: fillColor || '#000000',
			stroke: strokeColor || '#000000',
			strokeWidth: parseInt(strokeWidth!) || 2,
			originX: 'center',
			originY: 'center',
			selectable: true,
			hasControls: true,
			hasBorders: true,
			id: new Date().getTime(),
			name: type,
			objectDetail: {
				selectable: false,
				services: [],
				price: 0,
				descriptionLanguages: []
			}
		};

		let shape;
		switch (type) {
			case 'rectangle':
				shape = new fabric.Rect({
					...commonProps,
					width: 100,
					height: 100,
					rx: radius || 0,
					ry: radius || 0
				});
				break;
			case 'circle':
				shape = new fabric.Circle({
					...commonProps,
					radius: 50
				});
				break;
			case 'triangle':
				shape = new fabric.Triangle({
					...commonProps,
					width: 100,
					height: 100
				});
				break;
		}

		if (shape) {
			canvas.add(shape);
			canvas.setActiveObject(shape);
			canvas.centerObject(shape);
			updateLayers(); // Update layers after adding shape
			canvas.requestRenderAll();
		}
	}

	// Add this helper function to update object properties
	function updateObjectProperties(obj: any) {
		if (!obj) return;
		
		obj.set({
			fill: fillColor,
			stroke: strokeColor,
			strokeWidth: parseInt(strokeWidth!) || 2,
			rx: radius || 0,
			ry: radius || 0
		});

		if (itemWidth && itemHeight) {
			obj.set({
				width: parseInt(itemWidth),
				height: parseInt(itemHeight)
			});
		}

		canvas.requestRenderAll();
	}

	// Add function to handle layer selection
	function selectLayer(id: number) {
		const obj = canvas.getObjects().find((o: any) => o.id === id);
		if (obj) {
			canvas.setActiveObject(obj);
			canvas.requestRenderAll();
		}
	}
</script>


<!-- {#if fabric} -->
	
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

<div class="flex flex-col w-full h-full flex-1 bg-gray-100 text-gray-700">
	<div class="w-full grid grid-cols-6 h-full gap-4 p-4">
		<DrawingBar
			data={{
				canvas: canvas,
				files: files,
				objects: objects,
				selectedObjectId: selectedObjectId,
				fabric: fabric
			}}
			on:updateLayers={() => updateLayers()}
		/>

		<div 
			bind:this={container} 
			class="w-full h-full col-span-4 relative"
		>
			<div class="flex gap-4 mb-4">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>Canvas Size</InputAddon>
					<Select
						class="w-32 rounded"
						bind:value={canvasSize}
						on:change={updateCanvasSize}
						items={allowedSizes}
						placeholder="Select canvas size"
						disabled={$page.params.seatId !== 'create'}
					/>
				</ButtonGroup>

				{#if canvasSize === 'custom'}
					<ButtonGroup class="w-full" size="sm">
						<InputAddon>Width</InputAddon>
						<Input
							type="number"
							bind:value={CANVAS_WIDTH}
							on:input={handleCustomWidthChange}
							placeholder="Width"
							min="400"
							max="3840"
							disabled={$page.params.seatId !== 'create'}
						/>
					</ButtonGroup>
					<ButtonGroup class="w-full" size="sm">
						<InputAddon>Height</InputAddon>
						<Input
							type="number"
							bind:value={CANVAS_HEIGHT}
							on:input={handleCustomHeightChange}
							placeholder="Height"
							min="400"
							max="2160"
							disabled={$page.params.seatId !== 'create'}
						/>
					</ButtonGroup>
				{/if}
              </div>

			<div class="canvas-container">
				<canvas id="canvas" />
			</div>
		</div>

		<div class="p-4 overflow-y-auto pb-10 bg-gray-50 rounded" style="max-height: calc(100vh - 50px);">
			{#if canvas && isAnObjectSelected}
				<div class="pb-4 w-full">
					<Button on:click={addPropertiesToShape} class="w-full" outline>
						<label class="flex items-center space-x-3">
							<input
								type="checkbox"
								class="w-4 h-4 bg-gray-100 border-gray-300 focus:ring-2 mr-2 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
								bind:checked={objectDetail.selectable}
							/>
							<span>Selectable</span>
						</label>
					</Button>
				</div>
			{/if}
			<h1 class="mb-2 font-bold">Favourite Colors</h1>
			<div class="flex flex-wrap">
				{#each favColors as color}
					<div class="h-10 w-10 border-2 border-gray-200" style={`background-color:${color}`} />
				{/each}

				<ButtonGroup class="w-full my-3 " size="sm">
					<Input
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
							: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
						size="sm"
						placeholder="#FF0000"
						bind:value={newFavColor}
					/>
					<!-- svelte-ignore a11y-click-events-have-key-events -->

					<InputAddon
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-[#e1b168]  cursor-pointer p-0'
							: 'bg-[#e1b168]  cursor-pointer p-0'}
					>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="w-full h-full p-2" on:click={addNewFavColor}>
							{#if addFavColorLoading}
								<Spinner />
							{:else}
								<Plus />
							{/if}
						</div>
					</InputAddon>
				</ButtonGroup>
			</div>
			<div class="border-t-2 border-gray-200 my-5" />
			<div class="flex justify-start items-center">
				<span class="font-bold w-14">Fill</span>
				<input
					class="h-12 rounded-full flex-1"
					type="color"
					id="color-picker"
					bind:value={fillColor}
					on:input={updateFillColor}
				/>
			</div>
			<div class="flex items-center mt-2">
				<span class="font-bold mr-2 w-12">Stroke </span>
				<div class="flex items-center flex-1">
					<input
						class="h-12 rounded-full mr-2 flex-1"
						type="color"
						bind:value={strokeColor}
						on:input={updateStrokeColor}
						id="stroke-color-picker"
					/>
					<input
						class={`h-12 rounded-md flex-none w-24 ${
							localStorage.getItem('theme') === 'dark'
								? 'dark:bg-white dark:border-gray-400 dark:text-gray-700'
								: 'bg-white border-1 border-gray-400 text-gray-700'
						}`}
						type="number"
						disabled={strokeWidth === null || strokeWidth === undefined}
						bind:value={strokeWidth}
						on:input={updateStrokeWidth}
						placeholder="Width"
					/>
				</div>
			</div>
			<div class="border-t-2 border-gray-200 my-5" />
			<div class="grid grid-cols-3 gap-1 my-4">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-white border-2 dark:border-gray-300'
							: 'bg-white border-2 dark:border-gray-300'}>W</InputAddon
					>
					<Input
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
							: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
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
					<InputAddon
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-white border-2 dark:border-gray-300'
							: 'bg-white border-2 dark:border-gray-300'}>H</InputAddon
					>
					<Input
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
							: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
						type="number"
						disabled={itemWidth === null || itemWidth === undefined}
						bind:value={itemHeight}
						on:input={updateItemHeight}
						placeholder="Height"
						let:props
					/></ButtonGroup
				>
				<ButtonGroup class="w-full" size="sm">
					<InputAddon
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-white border-2 dark:border-gray-300'
							: 'bg-white border-2 dark:border-gray-300'}>(</InputAddon
					>
					<Input
						class={localStorage.getItem('theme') === 'dark'
							? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
							: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
						type="number"
						disabled={radius === null || radius === undefined}
						size="sm"
						bind:value={radius}
						on:input={updateCustomRectangle}
						placeholder="Radius"
					/></ButtonGroup
				>
			</div>
			<div class="border-t-2 border-gray-200 my-5" />
			{#if objectDetail.selectable}
				<div class="w-full">
					<ButtonGroup class="w-full mb-2" size="sm">
						<InputAddon
							class={localStorage.getItem('theme') === 'dark'
								? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
								: 'bg-white border-1 dark:border-gray-400 text-gray-700'}>Price $</InputAddon
						>
						<Input
							class={localStorage.getItem('theme') === 'dark'
								? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
								: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
							type="number"
							size="sm"
							placeholder="select price"
							bind:value={objectDetail.price}
						/></ButtonGroup
					>
					<div class="border-t-2 border-gray-200 my-5" />
					<div class="mt-2 mb-6">
						<Tabs style="pill">
							{#each languageEnumKeys as lang}
								<TabItem title={lang} open={lang === languageEnumKeys[0]}>
									<Textarea
										class={localStorage.getItem('theme') === 'dark'
											? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
											: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
										id="textarea-id"
										placeholder={`add description for ${lang}`}
										rows="8"
										value={objectDetailDescription?.find((x) => x.language === lang)?.description}
										on:input={(e) => addDescriptionToObjectDetail(e.target, lang)}
									/>
								</TabItem>
							{/each}
						</Tabs>
					</div>
					<div class="border-t-2 border-gray-200 my-5" />
					<p class="text-lg font-bold text-center text-primary">Select services for this seat</p>
					{#if $seatServices}
						{#each $seatServices as service}
							<div
								class="w-full rounded-md my-2 flex flex-col justify-between items-center px-6 flex-wrap"
							>
								{#if service.seat_services_languages}
									<div class="flex items-center">
										<div>
											<input
												type="checkbox"
												class="w-4 h-4 bg-gray-100 border-gray-300 focus:ring-2 mr-2 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
												checked={getSelectedObjectServiceDetail(service) ? true : false}
												on:click={() => {
													addServiceToActiveObject(service);
												}}
											/>
										</div>
										<div class="m-1 text-lg font-bold text-gray-700">
											{service?.seat_services_languages[0]?.title}
										</div>
										<div class="mx-3 text-primary font-bold">
											<h1>{service.price}$</h1>
										</div>
									</div>
								{/if}
								<div class="flex items-center w-full justify-between" />
								<div class="grid-cols-1 w-full">
									<Input
										class={localStorage.getItem('theme') === 'dark'
											? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
											: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
										type="number"
										size="sm"
										placeholder="max quantity for a user"
										value={getSelectedObjectServiceDetail(service)?.maxQuantityPerUser}
										on:change={(e) => addMaxServiceCount(e, service)}
										disabled={!objectDetail.services[0] ||
											objectDetail.services.find((x) => x.id == service.id) == undefined}
									/>

									<div class="my-2">
										<ButtonGroup class="w-full" size="sm">
											<InputAddon
												class={localStorage.getItem('theme') === 'dark'
													? 'dark:bg-white border-2 dark:border-gray-300'
													: 'bg-white border-2 dark:border-gray-300'}
												><div class="flex items-center">
													<input
														type="checkbox"
														class="w-4 h-4 bg-gray-100 border-gray-300 focus:ring-2 mr-2 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
														checked={getSelectedObjectServiceDetail(service)?.unlimitedFree}
														on:click={(event) => addFreeService(event, service)}
														disabled={!objectDetail.services[0] ||
															objectDetail.services.find((x) => x.id == service.id) == undefined}
													/>
													<p>unlimited free</p>
												</div></InputAddon
											>
											<Input
												class={localStorage.getItem('theme') === 'dark'
													? 'dark:bg-white border-1 dark:border-gray-400 dark:text-gray-700'
													: 'bg-white border-1 dark:border-gray-400 text-gray-700'}
												id="input-addon-sm"
												placeholder="max free quantity for a user"
												value={getSelectedObjectServiceDetail(service)?.maxFreeCount}
												on:change={(e) => addMaxFreeServiceCount(e, service)}
												disabled={!objectDetail.services[0] ||
													objectDetail.services.find((x) => x.id == service.id) == undefined ||
													getSelectedObjectServiceDetail(service)?.unlimitedFree === true}
											/>
										</ButtonGroup>
									</div>
								</div>
							</div>
							<div class="border-t-2 border-gray-200 my-5" />
						{/each}
					{/if}
				</div>
			{/if}
		</div>
		
	</div>
</div>
 
 
<style lang="scss">
	.canvas-container {
		position: relative;
		width: 100% !important;
		height: 100% !important;
		min-height: 600px;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden !important;
	}

	canvas {
		margin: 0;
		height: 100%;
		width: 100%;
		border: 1px solid gray;
	}

	// Make container scrollable if canvas is larger than viewport
	.overflow-auto {
		max-height: 90vh;
	}

	.layers-panel {
		margin-top: 1rem;
	}

	.layer-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		cursor: pointer;
		border: 1px solid #ddd;
		margin-bottom: 0.25rem;
	}

	.layer-item.selected {
		background-color: #e2e8f0;
	}
</style>

 
