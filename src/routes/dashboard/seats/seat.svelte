<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as d3 from 'd3';
	import SeatDesignSideBar from './seatDesignSideBar.svelte';
	import EditSideBar from './editSideBar.svelte';
	import { seatItemStore } from './seatItemStore';
	import { Button, ButtonGroup, Input, InputAddon } from 'flowbite-svelte';
	import { ArrowPath } from 'svelte-heros-v2';
	import { Lottie } from 'lottie-svelte';
    import { Direction } from 'lottie-svelte/iface';

	let selected: any;
	let selectedAreaSize: number | undefined;

	let seats: d3.Selection<SVGGElement, unknown, null, undefined>;
	let dragEnded = true;
	function draggedImage(event: any, seatGroup: d3.Selection<SVGGElement, any, any, any>) {
		const currentRotation = parseInt(seatGroup.attr('data-rotation') || '0');
		const rectElement = seatGroup.select('image').node() as SVGRectElement;
		const bbox = rectElement.getBBox();

		const halfCurrentWidth = bbox.width / 2;
		const halfCurrentHeight = bbox.height / 2;

		const centerX = event.x - halfCurrentWidth;
		const centerY = event.y - halfCurrentHeight;

		seatGroup.attr(
			'transform',
			`translate(${centerX},${centerY}) rotate(${currentRotation},${halfCurrentWidth},${halfCurrentHeight})`
		);

		// Show the rotated element again after the drag is complete
	}
	let isLoaded = false;

	onMount(() => {
		seats = d3.select(svg).append('g').attr('class', 'seats');
		isLoaded = true;
		// lines = d3.select(svg).append('g').attr('class', 'lines');
		// path = d3.select(svg).append('g').attr('class', 'path');

		// const drag = d3
		// 	.drag()
		// 	.subject((event) => event.subject)
		// 	.on('start', dragstarted)
		// 	.on('drag', dragged)
		// 	.on('end', dragended);

		// if (clonedSeat != null) {
		// 	clonedSeat.node().appendChild(rotationIndicator.node());
		// }
	});

	function drawLine(x1: number, y1: number, x2: number, y2: number) {
		lines
			.append('line')
			.attr('x1', x1)
			.attr('y1', y1)
			.attr('x2', x2)
			.attr('y2', y2)
			.attr('stroke', 'black')
			.attr('stroke-width', 2);
	}
	function resizeImage(
		event: d3.D3DragEvent<any, any, any>,
		seatGroup: d3.Selection<SVGGElement, any, any, any>
	) {
		const newWidth = Math.max(20, event.x);
		const newHeight = Math.max(20, event.y);
		seatGroup.select('image').attr('width', newWidth).attr('height', newHeight);

		seatGroup.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
	}

	$: {
		if (selected) {
			const clonedImage: d3.Selection<SVGGElement, any, any, any> = seats
				.append('g')
				.datum(d)
				.attr('transform', `translate(20,20)`)
				.attr('data-rotation', '0')
				.call(d3.drag().on('drag', (event) => draggedImage(event, clonedImage)) as any)
				.on('click', (event, d) => {});
			// clonedImage
			// 	.append('rect')
			// 	.attr('width', 20)
			// 	.attr('height', 20)
			// 	// fill color
			// 	.attr('fill', `#${Math.floor(Math.random() * 16777215).toString(16)}`)
			// 	.attr('rx', 1)
			// 	.attr('ry', 1);
			clonedImage
				.append('image')
				.attr('width', 20)
				.attr('height', 20)
				.attr('preserveAspectRatio', 'none')
				.attr('xlink:href', selected)
				.attr('transform', `translate(20,20)`);

			clonedImage
				.append('circle')
				.attr('class', 'resize-handle')
				.attr('cx', seatWidth)
				.attr('cy', seatHeight)
				.attr('r', 5)
				.attr('fill', 'green')
				.call(
					d3.drag().on('drag', (event) => {
						resizeImage(event, clonedImage);
						selectedItem(clonedImage, 'image');
					}) as any
				);
			// fill color
		}
	}

	let svg: SVGSVGElement;
	const seatWidth = 50;
	const seatHeight = 50;
	let lines: d3.Selection<SVGGElement, unknown, null, undefined>;
	let d = '';
	const paths: string[] = [];
	let path: any;
	let currentPath: string = '';

	let radiusInput = '';

	let currentLine: d3.Selection<SVGLineElement, any, any, any> | null = null;

	function resetSelectedSeat(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('rect')) {
		} else {
			const seatGroup = d3.select(target.closest('g')) as d3.Selection<SVGGElement, any, any, any>;
			if (seatGroup) {
				selectedItem(seatGroup);
			}
		}
	}
	let startPoint: any = null;
	let firstPoint: any = null;
	let linePreview: any = null;
	function distanceBetweenPoints(point1: any, point2: any) {
		const dx = point1.x - point2.x;
		const dy = point1.y - point2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function onMouseDown(event: MouseEvent) {
		const currentPoint = { x: event.offsetX, y: event.offsetY };
		seatItemStore.reset();
		return;
		if (startPoint) {
			console.log('$$$$$$$$$$$$$$$$$$$$$$$$', distanceBetweenPoints(startPoint, currentPoint));
		}
		if (firstPoint && distanceBetweenPoints(firstPoint, currentPoint) <= 50) {
			// 10 is the threshold value
			// Close the shape
			console.log(firstPoint.x, firstPoint.y);
			console.log(currentPoint.x, currentPoint.y);
			const line = `M ${firstPoint.x} ${firstPoint.y} L ${currentPoint.x} ${currentPoint.y}`;
			paths.push(line);

			// // Connect the last point to the first point
			// const connectLine = `M ${currentPoint.x} ${currentPoint.y} L ${firstPoint[1]} ${firstPoint[2]}`;
			// paths.push(connectLine);

			path
				.selectAll('path')
				.data(paths)
				.join('path')
				.attr('d', (d: any) => d)
				.attr('fill', 'none')
				.attr('stroke', 'black')
				.attr('stroke-dasharray', '0')
				.attr('stroke-width', 2);

			// Remove the starting point circle and line preview
			path.selectAll('circle').remove();
			if (linePreview) {
				linePreview.remove();
				linePreview = null;
			}

			// Reset the startPoint
			startPoint = null;
		} else {
			if (!startPoint) {
				startPoint = { x: event.offsetX, y: event.offsetY };
				firstPoint = { x: event.offsetX, y: event.offsetY };
				// Add a circle at the starting point
				path
					.append('circle')
					.attr('cx', startPoint.x)
					.attr('cy', startPoint.y)
					.attr('r', 3)
					.attr('fill', 'black');
			} else {
				const line = `M ${startPoint.x} ${startPoint.y} L ${event.offsetX} ${event.offsetY}`;
				console.log('line', line);
				console.log('before  removed', linePreview);
				paths.push(line); // Add the line to the existing paths
				path
					.selectAll('path')
					.data(paths) // Update with the existing paths
					.join('path')
					.attr('d', (d: any) => d)
					.attr('fill', 'none')
					.attr('stroke', 'black')
					.attr('stroke-dasharray', '0')
					.attr('stroke-width', 2);

				// Remove the starting point circle and line preview
				path.selectAll('circle').remove();
				console.log('before  removed', linePreview);
				linePreview = null;
				console.log('linePreview removed', linePreview);
				// Reset the startPoint for the next line segment and set it as the new starting point
				startPoint = { x: event.offsetX, y: event.offsetY };

				// Add a circle at the new starting point
				path
					.append('circle')
					.attr('cx', startPoint.x)
					.attr('cy', startPoint.y)
					.attr('r', 3)
					.attr('fill', 'black');
			}
		}

		resetSelectedSeat(event);
	}

	function onMouseMove(event: MouseEvent) {
		// if (startPoint) {
		// 	// Update line preview
		// 	const previewLine = `M ${startPoint.x} ${startPoint.y} L ${event.offsetX} ${event.offsetY}`;
		// 	console.log('previewLine', previewLine);
		// 	console.log('linePreview', linePreview);
		// 	if (!linePreview) {
		// 		console.log('linePreview', linePreview);
		// 		console.log('linePreview', linePreview);
		// 		linePreview = path
		// 			.append('path')
		// 			.attr('stroke', 'black')
		// 			.attr('stroke-width', 2)
		// 			.attr('stroke-dasharray', '5,5');
		// 	}
		// 	console.log('linePreview', 'asdf');
		// 	linePreview.attr('d', previewLine);
		// }
	}

	function onEscKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			linePreview.remove();
			linePreview = null;
			path.selectAll('circle').remove();
			currentLine = null;
			startPoint = null;
			// penSelected = false;
		}
	}

	function selectedItem(
		item: d3.Selection<SVGGElement, any, any, any>,
		image: string | null = null
	) {
		let seatGroup;
		console.log('image', image);
		if (image == 'image') {
			seatGroup = item.select('image');
		} else {
			seatGroup = item.select('rect');
		}
		const currentSeatGroup = d3.select(item.node());
		const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;

		const transform = currentSeatGroup.attr('transform');
		const translateMatch = transform.match(translateRegex);
		const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
		const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
	}

	// window.addEventListener('keydown', onEscKey);
	function numberBinding(node: any, value: any) {
		node.value = value;
		node.addEventListener('input', () => {
			value = parseFloat(node.value) || 0;
			node.dispatchEvent(new CustomEvent('numberinput', { detail: value }));
		});

		return {
			update(newValue: any) {
				if (newValue !== value) {
					node.value = newValue;
					value = newValue;
				}
			},
			destroy() {
				node.removeEventListener('input', numberBinding);
			}
		};
	}

	enum AreaType {
		square = 1,
		rectangle = 0.5625,
		rectangle2 = 1.25
	}

	function onAreaSizeClick(areaType: AreaType) {
		console.log('areaType', areaType);
		selectedAreaSize = areaType;
	}

	// Remove the event listener when the component is destroyed
</script>

<svelte:window on:keydown={onEscKey} />
{#if isLoaded}
	<div class="h-screen flex" style="height: calc(100vh - 150px);">
		<SeatDesignSideBar placeHolder={'.svgPlaceholder'} />
		<div class="flex-1 relative">
			{#if selectedAreaSize}
				<div class=" relative w-full" style={`padding-bottom: calc(${selectedAreaSize} * 100%);`}>
					<svg
						on:mousedown={onMouseDown}
						on:mousemove={onMouseMove}
						bind:this={svg}
						class="absolute top-0 left-0 w-full h-full border-gray border svgPlaceholder"
						xmlns="http://www.w3.org/2000/svg"
					/>
				</div>
			{:else}
				<div class="w-full h-full flex flex-col justify-center items-center">
					<Lottie
						path="./love.json"
						autoplay={true}
						loop={false}
						speed={0.2}
						direction={Direction.REVERSE}
					/>
					<div class="mb-2">Please select the aspect ratio of seats holder first</div>
					<ButtonGroup>
						<Button on:click={() => onAreaSizeClick(AreaType.square)} outline color="dark"
							>Square 1:1</Button
						>
						<Button on:click={() => onAreaSizeClick(AreaType.rectangle)} outline color="dark"
							>Rectangle 16:9</Button
						>
						<Button on:click={() => onAreaSizeClick(AreaType.rectangle2)} outline color="dark"
							>Rectangle 4:5</Button
						>
					</ButtonGroup>
				</div>
			{/if}

			<!-- <svg
				on:mousedown={onMouseDown}
				on:mousemove={onMouseMove}
				bind:this={svg}
				class={'w-full h-full border svgPlaceholder '}
				xmlns="http://www.w3.org/2000/svg"
			/> -->
		</div>
		<EditSideBar placeHolder={'.svgPlaceholder'} />
	</div>
{/if}
