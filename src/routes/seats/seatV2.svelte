<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Konva from 'konva';

	const seatProperties = writable({
		x: 100,
		y: 100,
		width: 50,
		height: 50,
		rotation: 0
	});

	let stage: Konva.Stage;

	onMount(() => {
		function getCorner(
			pivotX: number,
			pivotY: number,
			diffX: number,
			diffY: number,
			angle: number
		) {
			const distance = Math.sqrt(diffX * diffX + diffY * diffY);

			/// find angle from pivot to corner
			angle += Math.atan2(diffY, diffX);

			/// get new x and y and round it off to integer
			const x = pivotX + distance * Math.cos(angle);
			const y = pivotY + distance * Math.sin(angle);

			return { x: x, y: y };
		}
		function getClientRect(rotatedBox: any) {
			const { x, y, width, height } = rotatedBox;
			const rad = rotatedBox.rotation;

			const p1 = getCorner(x, y, 0, 0, rad);
			const p2 = getCorner(x, y, width, 0, rad);
			const p3 = getCorner(x, y, width, height, rad);
			const p4 = getCorner(x, y, 0, height, rad);

			const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
			const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
			const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
			const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

			return {
				x: minX,
				y: minY,
				width: maxX - minX,
				height: maxY - minY
			};
		}

		function getTotalBox(boxes: any) {
			let minX = Infinity;
			let minY = Infinity;
			let maxX = -Infinity;
			let maxY = -Infinity;

			boxes.forEach((box: any) => {
				minX = Math.min(minX, box.x);
				minY = Math.min(minY, box.y);
				maxX = Math.max(maxX, box.x + box.width);
				maxY = Math.max(maxY, box.y + box.height);
			});
			return {
				x: minX,
				y: minY,
				width: maxX - minX,
				height: maxY - minY
			};
		}

		const stage = new Konva.Stage({
			container: 'container',
			width: window.innerWidth,
			height: window.innerHeight
		});

		const layer = new Konva.Layer();
		stage.add(layer);

		const shape1 = new Konva.Rect({
			x: stage.width() / 2 - 60,
			y: stage.height() / 2 - 60,
			width: 50,
			height: 50,
			fill: 'red',
			draggable: true
		});
		layer.add(shape1);

		const tr = new Konva.Transformer({
			nodes: [shape1],
			boundBoxFunc: (oldBox, newBox) => {
				const box = getClientRect(newBox);
				const isOut =
					box.x < 0 ||
					box.y < 0 ||
					box.x + box.width > stage.width() ||
					box.y + box.height > stage.height();

				// if new bounding box is out of visible viewport, let's just skip transforming
				// this logic can be improved by still allow some transforming if we have small available space
				if (isOut) {
					return oldBox;
				}
				return newBox;
			}
		});
		layer.add(tr);

		// we can use transformer event
		// or just shape event
		tr.on('dragmove', () => {
			const boxes = tr.nodes().map((node) => node.getClientRect());
			const box = getTotalBox(boxes);
			tr.nodes().forEach((shape) => {});
		});
	});
</script>

<div id="container" />

<style>
	#container {
		width: 100%;
		height: 100%;
	}
</style>
