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
		console.log('Toggling background image');
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

<div class="flex justify-between bg-black text-gray-400 border-b border-gray-500 h-16">
	<div class="flex justify-between">
		<div class="mx-2 flex justify-center items-center customShape">
			{#each customShapes as shape}
				<div
					class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-[#111111] cursor-pointer"
					on:click={() => createCustomShape(shape)}
				>
					<div class={`${shape}  border-2 border-gray-400 cursor-pointer hover:bg-[#111111] `} />
				</div>
				<Tooltip placement="bottom">{`Add ${shape}`}</Tooltip>
			{/each}
		</div>

		<Button
			class="w-12 h-full border-none rounded-none flex justify-center items-center px-2 hover:bg-[#111111]  cursor-pointer"
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
			class="hover:bg-[#111111]  w-12 h-full border-none rounded-none flex justify-center items-center px-2 cursor-pointer"
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
			class="w-12 h-full border-none rounded-none flex justify-center items-center px-2 hover:bg-[#111111] cursor-pointer"
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
				class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-[#111111] cursor-pointer"
				on:click={selectImageForBackground}
			>
				<Photo size="20" class=" outline-none" />
			</div>
			<Tooltip placement="bottom">Add background Image</Tooltip>
		</div>

		<div
			class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-[#111111] cursor-pointer"
			on:click={toggleBackgroundImage}
		>
			<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
				><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				/><g id="SVGRepo_iconCarrier">
					<path
						d="M14.2647 15.9377L12.5473 14.2346C11.758 13.4519 11.3633 13.0605 10.9089 12.9137C10.5092 12.7845 10.079 12.7845 9.67922 12.9137C9.22485 13.0605 8.83017 13.4519 8.04082 14.2346L4.04193 18.2622M14.2647 15.9377L14.606 15.5991C15.412 14.7999 15.8149 14.4003 16.2773 14.2545C16.6839 14.1262 17.1208 14.1312 17.5244 14.2688C17.9832 14.4253 18.3769 14.834 19.1642 15.6515L20 16.5001M14.2647 15.9377L18.22 19.9628M12 4H7.2C6.07989 4 5.51984 4 5.09202 4.21799C4.7157 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V16.8C4 17.4466 4 17.9066 4.04193 18.2622M4.04193 18.2622C4.07264 18.5226 4.12583 18.7271 4.21799 18.908C4.40973 19.2843 4.7157 19.5903 5.09202 19.782C5.51984 20 6.07989 20 7.2 20H16.8C17.9201 20 18.4802 20 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V12M16 3L18.5 5.5M18.5 5.5L21 8M18.5 5.5L21 3M18.5 5.5L16 8"
						stroke="#89909c"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</g></svg
			>
		</div>
		<Tooltip placement="bottom">toggle background image</Tooltip>

		<div
			class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-[#111111] cursor-pointer"
			on:click={groupObjects}
		>
			<svg
				class="w-5 h-5"
				version="1.1"
				id="Layer_1"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				viewBox="0 0 33 32"
				enable-background="new 0 0 33 32"
				xml:space="preserve"
				fill="#000000"
				><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				/><g id="SVGRepo_iconCarrier">
					<g>
						<path
							fill="#89909c"
							d="M33.004,22.403c0-0.557-0.304-1.067-0.794-1.331c-0.242-0.131-0.546-0.04-0.678,0.203 c-0.131,0.243-0.04,0.546,0.203,0.678c0.243,0.13,0.269,0.358,0.269,0.45c0.001,0.092-0.025,0.32-0.269,0.451l-14.541,7.832 c-0.438,0.237-0.962,0.24-1.402,0.011l-14.52-7.54c-0.245-0.127-0.275-0.355-0.276-0.447c-0.002-0.092,0.021-0.32,0.263-0.455 c0.24-0.135,0.327-0.439,0.192-0.68c-0.135-0.243-0.441-0.327-0.681-0.193c-0.486,0.271-0.783,0.786-0.774,1.343 c0.008,0.557,0.321,1.063,0.815,1.32l14.52,7.54c0.361,0.188,0.757,0.282,1.151,0.282c0.408,0,0.815-0.1,1.187-0.299l14.541-7.833 C32.7,23.47,33.005,22.96,33.004,22.403z"
						/>
						<path
							fill="#89909c"
							d="M0.811,17.637l14.521,7.54c0.361,0.188,0.757,0.282,1.151,0.282c0.408,0,0.815-0.1,1.187-0.299 l14.541-7.833c0.49-0.264,0.795-0.774,0.794-1.332c0-0.557-0.304-1.067-0.794-1.331c-0.242-0.131-0.546-0.04-0.678,0.203 c-0.131,0.243-0.04,0.546,0.203,0.678c0.243,0.13,0.269,0.358,0.269,0.45c0.001,0.092-0.025,0.32-0.269,0.451l-14.541,7.832 c-0.438,0.237-0.962,0.239-1.402,0.011l-14.521-7.54c-0.245-0.127-0.274-0.354-0.276-0.446c-0.001-0.092,0.021-0.32,0.263-0.455 c0.24-0.135,0.327-0.439,0.192-0.68c-0.135-0.242-0.44-0.327-0.681-0.193c-0.486,0.271-0.783,0.787-0.774,1.344 C0.004,16.875,0.316,17.38,0.811,17.637z"
						/>
						<path
							fill="#89909c"
							d="M0.812,11.229l14.52,7.54c0.354,0.184,0.752,0.281,1.151,0.281c0,0,0,0,0.001,0 c0.412,0,0.822-0.104,1.186-0.299l14.541-7.833c0.49-0.264,0.795-0.774,0.794-1.332c0-0.557-0.304-1.067-0.794-1.331L17.702,0.443 c-0.735-0.397-1.672-0.391-2.403,0.018L0.771,8.566C0.284,8.838-0.013,9.353-0.004,9.91C0.004,10.467,0.317,10.973,0.812,11.229z M1.258,9.439l14.528-8.106c0.223-0.125,0.476-0.19,0.73-0.19c0.248,0,0.493,0.062,0.711,0.18l14.508,7.814 c0.243,0.13,0.269,0.358,0.269,0.45c0.001,0.092-0.025,0.32-0.269,0.451l-14.541,7.832c-0.218,0.118-0.464,0.18-0.711,0.18 c-0.001,0-0.001,0-0.001,0c-0.239,0-0.478-0.058-0.69-0.169l-14.52-7.54c-0.245-0.127-0.275-0.355-0.276-0.447 C0.994,9.803,1.018,9.574,1.258,9.439z"
						/>
					</g>
				</g></svg
			>
		</div>
		<Tooltip placement="bottom">Group Layers</Tooltip>

		<div
			class="h-full w-12 flex justify-center items-center px-2 rounded-sm hover:bg-[#111111] cursor-pointer"
			on:click={unGroupObjects}
		>
			<svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
				><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				/><g id="SVGRepo_iconCarrier">
					<path d="M4 4L20 20" stroke="#89909c" stroke-width="1" stroke-linecap="round" />
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M6.51183 5.62604L3.55276 7.10557C3.21398 7.27496 2.99997 7.62123 2.99997 8C2.99997 8.37877 3.21398 8.72504 3.55276 8.89443L11.5528 12.8944C11.8343 13.0352 12.1657 13.0352 12.4472 12.8944L13.3359 12.4501L11.5355 10.6497L6.23604 8L8.00254 7.11675L6.51183 5.62604ZM13.7308 10.0166L17.7639 8L12 5.11803L9.88816 6.17394L8.39744 4.68323L11.5528 3.10557C11.8343 2.96481 12.1657 2.96481 12.4472 3.10557L20.4472 7.10557C20.786 7.27496 21 7.62123 21 8C21 8.37877 20.786 8.72504 20.4472 8.89443L15.2215 11.5073L13.7308 10.0166ZM14.5118 13.626L12 14.882L4.44719 11.1056C3.95321 10.8586 3.35254 11.0588 3.10555 11.5528C2.85856 12.0468 3.05878 12.6474 3.55276 12.8944L11.5528 16.8944C11.8343 17.0352 12.1657 17.0352 12.4472 16.8944L16.0025 15.1168L14.5118 13.626ZM17.8882 14.1739L16.3974 12.6832L19.5528 11.1056C20.0467 10.8586 20.6474 11.0588 20.8944 11.5528C21.1414 12.0468 20.9412 12.6474 20.4472 12.8944L17.8882 14.1739ZM17.1785 16.2927L12 18.882L4.44719 15.1056C3.95321 14.8586 3.35254 15.0588 3.10555 15.5528C2.85856 16.0468 3.05878 16.6474 3.55276 16.8944L11.5528 20.8944C11.8343 21.0352 12.1657 21.0352 12.4472 20.8944L18.6692 17.7834L17.1785 16.2927ZM20.5497 16.8355L19.0641 15.3499L19.5528 15.1056C20.0467 14.8586 20.6474 15.0588 20.8944 15.5528C21.1235 16.011 20.9678 16.5611 20.5497 16.8355Z"
						fill="#89909c"
					/>
				</g></svg
			>
		</div>
		<Tooltip placement="bottom">Ungroup layers</Tooltip>
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="mx-12">
		<div
			class="h-full flex justify-center items-center px-2 rounded-sm cursor-pointer"
			on:click={() => dispatch('openAddSeatModal')}
		>
			<Button>
				<svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
					><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
						id="SVGRepo_tracerCarrier"
						stroke-linecap="round"
						stroke-linejoin="round"
					/><g id="SVGRepo_iconCarrier">
						<path
							d="M16 8.98987V20.3499C16 21.7999 14.96 22.4099 13.69 21.7099L9.76001 19.5199C9.34001 19.2899 8.65999 19.2899 8.23999 19.5199L4.31 21.7099C3.04 22.4099 2 21.7999 2 20.3499V8.98987C2 7.27987 3.39999 5.87988 5.10999 5.87988H12.89C14.6 5.87988 16 7.27987 16 8.98987Z"
							stroke="white"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M22 5.10999V16.47C22 17.92 20.96 18.53 19.69 17.83L16 15.77V8.98999C16 7.27999 14.6 5.88 12.89 5.88H8V5.10999C8 3.39999 9.39999 2 11.11 2H18.89C20.6 2 22 3.39999 22 5.10999Z"
							stroke="white"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M7 12H11"
							stroke="white"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M9 14V10"
							stroke="white"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</g></svg
				>
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
			border-bottom: 20px solid #89909c;
			background-color: transparent !important;
		}
	}
</style>
