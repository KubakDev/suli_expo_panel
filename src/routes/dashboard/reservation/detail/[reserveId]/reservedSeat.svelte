<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Canvas } from 'fabric/fabric-impl';
	// @ts-ignore
	import { fabric } from 'fabric';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';

	export let data: any;
	export let reservations: any = [];
	// let fabric: any = null;
	let activeSeat: any = null;
	let canvas: Canvas;
	let container: any;
	$: {
		if (container) {
			adjustCanvasSize();
		}
	}
	onMount(async () => {
		if (data) {
			activeSeat = data.find((item: any) => item.is_active == true);
			if (activeSeat) {
				await loadSeats();
			}
		}
	});

	const adjustCanvasSize = () => {
		const width = activeSeat?.design.width;
		const height = activeSeat?.design.height;
		const aspectRatio = width / height;
		const containerWidth = container?.offsetWidth;

		if (container) container.style.height = `${containerWidth / aspectRatio}px`;

		const currentHeight = containerWidth / aspectRatio;
		if (canvas) {
			canvas.setDimensions({
				width: containerWidth,
				height: currentHeight
			});
		}
		canvas.renderAll();
	};
	const loadSeats = async () => {
		const canvasElement: any = document.getElementById('canvas');

		if (fabric) {
			canvas = new fabric.Canvas(canvasElement, {
				hoverCursor: 'default',
				selection: false
			});
			adjustCanvasSize();
			const width = activeSeat?.design.width;
			const height = activeSeat?.design.height;
			const containerWidth = container?.offsetWidth;
			const containerHeight = container?.offsetHeight;
			const widthRatio = containerWidth / width;
			const heightRatio = containerHeight / height;
			if (canvas) {
				canvas.loadFromJSON(activeSeat?.design, async () => {
					canvas.forEachObject((obj: any) => {
						obj.set('selectable', false);
						obj.set('lockMovementX', true);
						obj.set('lockMovementY', true);

						obj.setCoords();
					});
					await tick(); // wait for the next update cycle
					canvas.forEachObject((obj: any) => {
						const scaleX = obj.scaleX;
						const scaleY = obj.scaleY;
						const left = obj.left;
						const top = obj.top;
						const tempScaleX = scaleX * widthRatio;
						const tempScaleY = scaleY * heightRatio;
						const tempLeft = left * widthRatio;
						const tempTop = top * heightRatio;
						obj.scaleX = tempScaleX;
						obj.scaleY = tempScaleY;
						obj.left = tempLeft;
						obj.top = tempTop;
						obj.setCoords();
					});
					canvas.renderAll();
					checkIfTheSeatReserved();
				});
			}
		}
	};

	async function checkIfTheSeatReserved() {
		for (let object of activeSeat.design?.objects) {
			if (object?.id == reservations[0]?.object_id) {
				canvas.forEachObject((obj: any) => {
					if (obj.id == object.id) {
						obj.set({
							objectDetail: {
								...object.objectDetail,
								reserve: true
							}
						});

						if (
							reservations.find(
								(reservation: any) => reservation.status == ReservationStatusEnum.ACCEPT
							)
						) {
							obj.set('fill', '#ff176b');
							obj.set('stroke', '#ff176b');
							obj.set('strokeWidth', 3);
						} else {
							obj.set('fill', '#A0B0C2');
							obj.set('stroke', '#A0B0C2');
							obj.set('strokeWidth', 3);
						}
						if (obj.type == 'group') {
							obj.forEachObject((child: any) => {
								if (
									reservations.find(
										(reservation: any) => reservation.status == ReservationStatusEnum.ACCEPT
									)
								) {
									child.set('fill', '#ff176b');
									child.set('stroke', '#ff176b');
									child.set('strokeWidth', 3);
								} else {
									child.set('fill', '#A0B0C2');
									child.set('stroke', '#A0B0C2');
									child.set('strokeWidth', 3);
								}
							});
						}
						obj.setCoords();
						canvas.renderAll();
					}
				});
			}
		}
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
		margin: 20px 0;
	}
</style>
