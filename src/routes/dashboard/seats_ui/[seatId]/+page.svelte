<script lang="ts">
	// import { fabric } from "fabric";
	import { onMount, tick } from 'svelte';
	import type { PageData } from '../$types';
	import {
		Button,
		ButtonGroup,
		Checkbox,
		Input,
		InputAddon,
		Modal,
		Spinner,
		TabItem,
		Tabs,
		Textarea
	} from 'flowbite-svelte';
	import { Minus, Plus } from 'svelte-heros-v2';
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
	import { Property } from 'canvg';

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

	// Function to update layers
	onMount(async () => {
		const fabricModule = import('fabric');

		fabricModule.then(async (fabricResponse) => {
			let iconCanvas = new fabricResponse.fabric.StaticCanvas('');
			fabric = fabricResponse.fabric;
			iconCanvas.setWidth(50);
			iconCanvas.setHeight(50);
			await getFavColors();

			seatImageItemStore.getAllSeatItems();
			const x = await getSeatServices(data.supabase, 1, 15);
			canvas = new fabricResponse.fabric.Canvas('canvas', { isDrawingMode: false });
			canvas.on('path:created', (e: any) => {
				let path = e.path;
				path.set({ stroke: 'red' });
				canvas.renderAll();
			});
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

						const width = design.width;
						const height = design.height;
						const aspectRatio = width / height;
						const containerWidth = container?.offsetWidth;
						const containerHeight = container?.offsetHeight;
						const widthRatio = containerWidth / width;
						const heightRatio = containerHeight / height;

						const currentHeight = containerWidth / aspectRatio;

						if (canvas) {
							canvas.setDimensions({
								width: containerWidth,
								height: currentHeight
							});
						}
						await canvas.loadFromJSON(design, async () => {
							canvas.width = containerWidth;
							canvas.height = containerHeight;
							if (canvas.backgroundImage) {
								canvas.backgroundImage.scaleX = canvas.backgroundImage.scaleX * widthRatio;
								canvas.backgroundImage.scaleY = canvas.backgroundImage.scaleY * widthRatio;
							}
							await tick(); // wait for the next update cycle
							// get data
							getData();

							canvas.forEachObject((obj: any) => {
								const scaleX = obj.scaleX;
								const scaleY = obj.scaleY;
								const left = obj.left;
								const top = obj.top;
								const tempScaleX = scaleX * widthRatio;
								const tempScaleY = scaleY * widthRatio;
								const tempLeft = left * widthRatio;
								const tempTop = top * widthRatio;

								obj.scaleX = tempScaleX;
								obj.scaleY = tempScaleY;
								obj.left = tempLeft;
								obj.top = tempTop;

								obj.setCoords();
								// Ensure the object is above the background
								obj.set('z-index', 1);
							});

							canvas.renderAll();
						});

						canvas.renderAll();
					});
			} else {
				const containerWidth = container?.offsetWidth;
				const containerHeight = container?.offsetHeight;
				if (canvas) {
					canvas.setDimensions({
						width: containerWidth,
						height: containerHeight
					});
				}
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
					const text = new fabricResponse.fabric.IText('Click to edit text', {
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

					liveLine = new fabricResponse.fabric.Line(
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
						let polygon: any = new fabricResponse.fabric.Polygon(points, {
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
					let group = new fabricResponse.fabric.Group(activeObjects, {
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
				objectDetail = {
					selectable: false,
					services: [],
					price: 0
				};
				radius = 0;

				canvas.forEachObject((obj: any) => {
					if (obj.id === event.selected[0].id) {
						if (obj.objectDetail) {
							objectDetail = obj.objectDetail;
							objectDetailDescription = obj.objectDetail?.descriptionLanguages ?? [];
						}
						setSelectedObjectValue(obj);
					}
				});
			});

			canvas.on('selection:updated', function (event: any) {
				objectDetail = {
					selectable: false,
					services: [],
					price: 0
				};
				radius = 0;
				canvas.forEachObject((obj: any) => {
					if (obj.id === event.selected[0].id) {
						if (obj.objectDetail) {
							objectDetail = obj.objectDetail;
							objectDetailDescription = obj.objectDetail?.descriptionLanguages ?? [];
						}
						setSelectedObjectValue(obj);
					}
				});
			});

			canvas.on('selection:cleared', function (event: any) {
				clearAllInput();
				radius = null;
			});
			recordCanvasState();
			canvas.on('object:modified', function (event: any) {
				// var modifiedObject = event.target;
				// onObjectModified(modifiedObject);
				recordCanvasState();
			});

			window.addEventListener('keydown', function (e) {
				const selectedObject = canvas.getActiveObject();
				if (e.key === 'Delete') {
					removeSelectedObject();
				} else if (e.key === 'Delete') {
				}
			});

			// window.addEventListener('keydown', (e) => {
			// 	if (e.ctrlKey && e.code === 'KeyZ') {
			// 		undoSelectedObject();
			// 	} else if (e.ctrlKey && e.code === 'KeyY') {
			// 		redoSelectedObject();
			// 	}
			// });

			//function for copy
			window.addEventListener('keydown', (e) => {
				if (e.ctrlKey && e.code === 'KeyC') {
					const activeObject = canvas.getActiveObject();
					if (activeObject) {
						// copy the object and store it
						activeObject.clone((cloned: any) => {
							copiedObject = cloned;
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
								left: clonedObj.left + 10,
								top: clonedObj.top + 10,
								evented: true
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
		});
	});

	function getData() {
		if (canvas) {
			objects = canvas.getObjects();
		}
	}

	let copiedObject: any = null;
	let history: any = [];
	let currentHistoryIndex = 0;

	function recordCanvasState() {
		// remove future states if we are in the middle of the history
		history = history.slice(0, currentHistoryIndex + 1);
		history.push(canvas.toJSON());
		currentHistoryIndex++;
	}

	function undoSelectedObject() {
		if (currentHistoryIndex === 0) return; // no previous state
		currentHistoryIndex--;
		canvas.loadFromJSON(history[currentHistoryIndex], () => {
			canvas.renderAll();
		});
	}

	function redoSelectedObject() {
		if (currentHistoryIndex >= history.length - 1) return; // No future state
		currentHistoryIndex++;
		canvas.loadFromJSON(history[currentHistoryIndex], () => {
			canvas.renderAll();
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
						canvas.remove(obj);
					});
				} else if (activeObject) {
					canvas.remove(activeObject);
				}
				canvas.requestRenderAll();
			} catch (e) {}
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
			objectDetail: {
				selectable: !objectDetail.selectable
			}
		});
		objectDetail.selectable = !objectDetail.selectable;
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
				console.log(Response.data);
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
	<div class="w-full grid grid-cols-6 h-full">
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

		<div bind:this={container} class="w-full min-h-[200px] col-span-4 relative overflow-hidden">
			<canvas id="canvas" class="h-full w-full fabric-canvas" />
			<div class="absolute bottom-20 right-10 w-40 flex justify-between">
				<Button on:click={zoomIn} pill={true} outline={true} class="w-full1"><Plus /></Button>
				<Button on:click={zoomOut} pill={true} outline={true} class="w-full1"><Minus /></Button>
			</div>
		</div>

		<div class="p-4 overflow-y-auto pb-10" style="max-height: calc(100vh - 50px);">
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
						size="sm"
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

<!-- {/if} -->
<style lang="scss">
	canvas {
		border: 1px solid #89909c;
		// padding: 10px;
		border-radius: 5px;
		margin-top: 10px;
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

	.rotate-handle {
		left: -24px;
		top: -24px;
		cursor: grab;
		color: red;
	}
	div::-webkit-scrollbar {
		width: 0.5em; /* Adjust as needed */
	}

	/* Style the scrollbar thumb (optional) */
	div::-webkit-scrollbar-thumb {
		background-color: transparent; /* Hide the scrollbar thumb */
	}

	//spinner
	.spinner-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.loader {
		border: 5px solid #f3f3f3;
		border-top: 5px solid #000000;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
