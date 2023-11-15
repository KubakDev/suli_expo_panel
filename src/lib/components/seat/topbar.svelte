<script lang="ts">
	import { Button, Tooltip } from 'flowbite-svelte';
	import { SeatCustomShapes } from '../../../models/seatUi';
	import { ChatBubbleBottomCenter, Pencil, Photo } from 'svelte-heros-v2';
	import { fabric } from 'fabric';
	import RemoveImageSvg from '$lib/images/icons/removeImage.svg';
	import ReloadImageSvg from '$lib/images/icons/reloadImage.svg';
	import SaveIconSvg from '$lib/images/icons/saveIcon.svg';
	import LayerGroup from '$lib/images/icons/layerGroup.svg';
	import LayerUnGroup from '$lib/images/icons/layerUnGroup.svg';
	import { EditingMode } from '../../../models/editingModeModel';
	import { createEventDispatcher } from 'svelte';

	class MyGroup extends fabric.Group {
		groupId: number;

		constructor(items: fabric.Object[], options: any = {}) {
			super(items, options);
			this.groupId = options.groupId;
		}
	}
	const dispatch = createEventDispatcher();
	let backgroundImageSelected: boolean | undefined = undefined;

	export let data: {
		fillColor?: string;
		canvas?: fabric.Canvas;
		strokeColor?: string;
		isDrawing?: boolean;
		isAddingText?: boolean;
		EditingMode?: EditingMode;
		container?: HTMLElement;
	};
	let customShapes = (Object.keys(SeatCustomShapes) as Array<keyof typeof SeatCustomShapes>).map(
		(key) => SeatCustomShapes[key]
	);

	function createCustomShape(shape?: SeatCustomShapes) {
		if (shape === undefined) return;
		let customShape;
		switch (shape) {
			case SeatCustomShapes.Rectangle:
				customShape = new fabric.Rect({
					width: 100,
					height: 50,
					fill: data?.fillColor,
					left: 0,
					top: 0
				});
				break;

			case SeatCustomShapes.Circle:
				customShape = new fabric.Circle({
					radius: 50,
					fill: data?.fillColor,
					left: 0,
					top: 0
				});
				break;

			case SeatCustomShapes.Ellipse:
				customShape = new fabric.Ellipse({
					rx: 50,
					ry: 25,
					fill: data?.fillColor,
					left: 0,
					top: 0
				});
				break;

			case SeatCustomShapes.Line:
				customShape = new fabric.Line([50, 100, 200, 200], {
					fill: data?.fillColor,
					stroke: data?.strokeColor ?? 'black',
					strokeWidth: 5,
					left: 0,
					top: 0
				});
				break;

			case SeatCustomShapes.Triangle:
				customShape = new fabric.Triangle({
					width: 100,
					height: 100,
					fill: data?.fillColor,
					left: 0,
					top: 0
				});
				break;
		}
		customShape.id = new Date().getTime();
		data?.canvas?.add(customShape);
		dispatch('updateLayers');
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
					const containerWidth = data.container?.offsetWidth;

					const imageRatio = image.width! / image.height!;

					// change canvas size to fit container
					data.canvas?.setWidth(containerWidth!);

					// set image height to respect ratio

					const canvasHeight = containerWidth! / imageRatio;

					data.canvas?.setHeight(canvasHeight);

					data.canvas?.setBackgroundImage(image, data.canvas?.renderAll.bind(data.canvas), {
						scaleX: data.canvas?.width! / image!.width!,
						scaleY: data.canvas?.height! / image!.height!
					});
				};
			};
			reader.readAsDataURL(file);
		};
		input.click();
	}
	function toggleBackgroundImage() {
		// hide and show background image
		let image: any = data.canvas?.backgroundImage;
		if (image) {
			backgroundImageSelected = !image.visible;
			image.visible = !image.visible;
			data.canvas?.renderAll();
		}
	}
	function groupObjects() {
		let activeObjects = data.canvas?.getActiveObjects();
		if (activeObjects) {
			data.canvas?.discardActiveObject();
			const group = new MyGroup(activeObjects, { id: Date.now() });
			group._objects.forEach((obj: any) => {
				obj.id = group.groupId; // Add groupId to each object
			});
			data.canvas?.add(group);
			activeObjects.forEach((obj) => data.canvas?.remove(obj)); // Remove individual objects that are now part of the group
			data.canvas?.requestRenderAll();
		}
	}

	function unGroupObjects() {
		let group: any = data.canvas?.getActiveObject();
		if (group && group.type === 'group') {
			let items = group._objects;
			let currentTime = new Date().getTime();
			group.destroy(); // Destroy the group and remove it from the canvas
			data.canvas?.remove(group);

			// Add the individual items back to the canvas with new unique IDs
			items.forEach((obj: any) => {
				obj.id = currentTime;
				obj.groupId = undefined;
				data.canvas?.add(obj);
				obj.setCoords();
				currentTime += 1000; //increment current time by 1 second for the next object
			});

			data.canvas?.renderAll();
			dispatch('updateLayers');
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
	class="flex justify-between bg-backgroundComponent dark:text-gray-900 border-b border-gray-500 h-16"
>
	<div class="flex justify-between">
		<div class="mx-2 flex justify-center items-center customShape">
			{#each customShapes as shape}
				<div
					class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-gray-300 cursor-pointer"
					on:click={() => createCustomShape(shape)}
				>
					<div class={`${shape} bg-black cursor-pointer hover:bg-secondary `} />
				</div>
				<Tooltip placement="bottom">{`Add ${shape}`}</Tooltip>
			{/each}
		</div>

		<Button
			class="w-12 h-full border-none rounded-none flex justify-center items-center px-2 hover:bg-gray-300 cursor-pointer"
			size="lg"
			color={data?.canvas && data?.canvas?.isDrawingMode ? 'primary' : 'none'}
			on:click={() =>
				dispatch('toggleDrawingMode', {
					type: EditingMode.Draw
				})}
		>
			<Pencil size="20" class=" outline-none" />
			<Tooltip placement="bottom">draw a shape</Tooltip>
		</Button>
		<Button
			class="w-12 h-full border-none rounded-none flex justify-center items-center px-2 hover:bg-gray-300 cursor-pointer"
			size="lg"
			color={data?.isDrawing ? 'primary' : 'none'}
			on:click={() =>
				dispatch('toggleDrawingMode', {
					type: EditingMode.Line
				})}
		>
			<Pencil size="20" class="  dark:text-green-700 outline-none " />
			<Tooltip placement="bottom">draw auto organize shape</Tooltip>
		</Button>
		<!-- add text  -->
		<Button
			id="group-button"
			class="w-12 h-full border-none rounded-none flex justify-center items-center px-2 hover:bg-gray-300 cursor-pointer"
			size="lg"
			color={data?.isAddingText ? 'primary' : 'none'}
			on:click={() =>
				dispatch('toggleDrawingMode', {
					type: EditingMode.Text
				})}><ChatBubbleBottomCenter /></Button
		>
		<Tooltip placement="bottom">Add Text</Tooltip>
		<div class="mx-2 flex justify-center items-center customShape">
			<div
				class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-gray-300 cursor-pointer"
				on:click={selectImageForBackground}
			>
				<Photo size="20" class=" outline-none" />
			</div>
			<Tooltip placement="bottom">Add background Image</Tooltip>
		</div>

		<div
			class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-gray-300 cursor-pointer"
			on:click={toggleBackgroundImage}
		>
			<img
				src={backgroundImageSelected == false ? ReloadImageSvg : RemoveImageSvg}
				alt="notFound"
				class="object-fill"
				style="height: 20px;"
			/>
		</div>
		<Tooltip placement="bottom">toggle background image</Tooltip>

		<div
			class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-gray-300 cursor-pointer"
			on:click={groupObjects}
		>
			<img src={LayerGroup} alt="notFound" class="object-fill" style="height: 20px;" />
		</div>
		<Tooltip placement="bottom">Group Layers</Tooltip>

		<div
			class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-gray-300 cursor-pointer"
			on:click={unGroupObjects}
		>
			<img src={LayerUnGroup} alt="notFound" class="object-fill" style="height: 20px;" />
		</div>
		<Tooltip placement="bottom">Ungroup layers</Tooltip>
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class=" mx-12">
		<div
			class="h-full flex justify-center items-center px-2 rounded-sm hover:bg-gray-300 cursor-pointer"
			on:click={() => dispatch('openAddSeatModal')}
		>
			<Button outline>
				<img src={SaveIconSvg} alt="notFound" class="object-fill mx-1" style="height: 20px;" />
				Save Seat
			</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.customShape {
		.Circle {
			width: 20px;
			height: 20px;
			border-radius: 50%;
		}
		.Rectangle {
			height: 15px;
			width: 30px;
		}
		.Ellipse {
			height: 15px;
			width: 30px;
			border-radius: 50%;
		}
		.Line {
			position: relative;
			width: 25px;
			height: 2px;
			background-color: black;
			rotate: 45deg;
		}

		.Triangle {
			width: 0;
			height: 0;
			border-left: 10px solid transparent;
			border-right: 10px solid transparent;
			border-bottom: 20px solid black;
			background-color: transparent !important;
		}
	}
</style>
