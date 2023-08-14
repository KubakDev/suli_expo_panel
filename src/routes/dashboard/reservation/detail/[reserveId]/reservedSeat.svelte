<script lang="ts">
	import { Button, Checkbox } from 'flowbite-svelte';
	import { onMount, tick } from 'svelte';
	import { fabric } from 'fabric';
	import type { Canvas } from 'fabric/fabric-impl';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: any;
	export let supabase: SupabaseClient;
	export let reservedData: any = [];

	let previousReserveSeatData: any = [];
	let canvas: Canvas;
	let container: any;
	let selectedObject: any = undefined;
	let selectableObjectServices: {}[] = [];
	let selectableObjectTotalPrice: number = 0;
	let popupPosition = {
		top: 0,
		left: 0
	};
	let freeServices: any = [];
	let paidServices: any = [];

	onMount(async () => {
		if (data) {
			await loadSeats();
		}
	});

	const adjustCanvasSize = () => {
		const width = data[0]?.design.width;
		const height = data[0]?.design.height;
		const aspectRatio = width / height;
		const containerWidth = container?.offsetWidth;
		container.style.height = `${containerWidth / aspectRatio}px`;

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
		if (fabric) {
			const canvasElement: any = document.getElementById('canvas');
			canvas = new fabric.Canvas(canvasElement, {
				hoverCursor: 'default',
				selection: false
			});
			adjustCanvasSize();
			const width = data[0]?.design.width;
			const height = data[0]?.design.height;
			const containerWidth = container?.offsetWidth;
			const containerHeight = container?.offsetHeight;
			const widthRatio = containerWidth / width;
			const heightRatio = containerHeight / height;
			canvas.loadFromJSON(data[0]?.design, async () => {
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
	};

	async function checkIfTheSeatReserved() {
		for (let object of data[0].design?.objects) {
			console.log(object);
			if (object?.id == reservedData?.object_id) {
				canvas.forEachObject((obj: any) => {
					if (obj.id == object.id) {
						obj.set({
							objectDetail: {
								...object.objectDetail,
								reserve: true
							}
						});
						if (reservedData.status == 'pending') {
							obj.set('fill', '#A0B0C2');
							obj.set('backgroundColor', '#A0B0C2');
							obj.set('stroke', '#A0B0C2');
							obj.set('strokeWidth', 3);
						} else if (reservedData.status == 'accept') {
							obj.set('fill', '#ff176b');
							obj.set('backgroundColor', '#ff176b');
							obj.set('stroke', '#ff176b');
							obj.set('strokeWidth', 3);
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
	<div bind:this={container} class=" w-full relative overflow-hidden">
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
