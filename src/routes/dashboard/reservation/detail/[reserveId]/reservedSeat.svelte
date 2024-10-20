<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Canvas } from 'fabric/fabric-impl';
	// @ts-ignore
	import { fabric } from 'fabric';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import type { PageData } from './$types';

	export let data: any;
	export let reservations: any = [];
	// let fabric: any = null;
	let activeSeat: any = null;
	let canvas: Canvas;
	let container: any;
	let seatsLoaded: boolean = false; // Flag to prevent multiple loads

	$: {
		if (container) {
			adjustCanvasSize();
		}
	}

	onMount(async () => {
		if (data) {
			activeSeat = data.find((item: any) => item.is_active === true);
			if (activeSeat && !seatsLoaded) {
				await loadSeats();
				seatsLoaded = true; // Set flag after loading seats
			}
		}
	});

	const adjustCanvasSize = () => {
		const width = activeSeat?.design?.width;
		const height = activeSeat?.design?.height;
		const aspectRatio = width / height;
		const containerWidth = container?.offsetWidth;

		if (container) container.style.height = `${containerWidth / aspectRatio}px`;

		const currentHeight = containerWidth / aspectRatio;
		if (canvas) {
			canvas.setDimensions({
				width: containerWidth,
				height: currentHeight
			});
			canvas.renderAll();
		}
	};

	const loadSeats = async () => {
		const canvasElement: any = document.getElementById('canvas');

		if (fabric) {
			canvas = new fabric.Canvas(canvasElement, {
				hoverCursor: 'default',
				selection: false
			});
			adjustCanvasSize();
			const width = activeSeat?.design?.width;
			const height = activeSeat?.design?.height;
			const containerWidth = container?.offsetWidth;
			const containerHeight = container?.offsetHeight;
			const widthRatio = containerWidth / width;
			const heightRatio = containerHeight / height;
			if (canvas) {
				canvas.loadFromJSON(activeSeat?.design, async () => {
					canvas.forEachObject((obj: any) => {
						obj.set({
							selectable: false,
							lockMovementX: true,
							lockMovementY: true
						});
						obj.setCoords();
					});
					await tick(); // wait for the next update cycle
					canvas.forEachObject((obj: any) => {
						obj.scaleX *= widthRatio;
						obj.scaleY *= heightRatio;
						obj.left *= widthRatio;
						obj.top *= heightRatio;
						obj.setCoords();
					});
					canvas.renderAll();
					checkIfTheSeatReserved();
				});
			}
		}
	};

	async function checkIfTheSeatReserved() {
		if (!activeSeat?.design?.objects || reservations.length === 0) return;

		// Create a map of object_id to reservation status
		const reservationMap: Record<string, ReservationStatusEnum> = {};
		reservations.forEach((reservation: any) => {
			reservationMap[reservation.object_id] = reservation.status;
		});

	  
		// Iterate through all objects and apply reservation status
		canvas.forEachObject((obj: any) => {
			const reservationStatus = reservationMap[obj.id];
			if (reservationStatus !== undefined) {
				obj.set({
					objectDetail: {
						...obj.objectDetail,
						reserve: true
					}
				});

				if (reservationStatus === ReservationStatusEnum.ACCEPT) {
					obj.set({
						fill: '#ff176b',
						stroke: '#ff176b',
						strokeWidth: 3
					});
					if (obj.type === 'group') {
						obj.forEachObject((child: any) => {
							child.set({
								fill: '#ff176b',
								stroke: '#ff176b',
								strokeWidth: 3
							});
						});
					}
				} else {
					obj.set({
						fill: '#A0B0C2',
						stroke: '#A0B0C2',
						strokeWidth: 3
					});
					if (obj.type === 'group') {
						obj.forEachObject((child: any) => {
							child.set({
								fill: '#A0B0C2',
								stroke: '#A0B0C2',
								strokeWidth: 3
							});
						});
					}
				}
				obj.setCoords();
			}
		});

		// Render once after all updates
		canvas.renderAll();
	}
</script>

{#if fabric}
	<div bind:this={container} class="min-h-[200px] w-full relative overflow-hidden">
		<canvas id="canvas" class="h-full w-full fabric-canvas" />
		<div class="absolute bottom-10 right-10 w-40 flex justify-between" />
	</div>
{/if}

<style>
	canvas {
		border: 1px solid rgb(158, 157, 157);
	}
</style>
