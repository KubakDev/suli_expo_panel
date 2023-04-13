<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as d3 from 'd3';
	import Battery from '$lib/icons/b.svg?component';

	let svg: SVGSVGElement;
	const seatWidth = 50;
	const seatHeight = 50;
	let lines: d3.Selection<SVGGElement, unknown, null, undefined>;
	let d = '';
	const paths: string[] = [];
	let path: any;
	let currentPath: string = '';
	const clonedSeats = new Set<d3.Selection<SVGGElement, any, any, any>>();
	let currentLine: d3.Selection<SVGLineElement, any, any, any> | null = null;
	let isDrawing = false;
	onMount(() => {
		const seats = d3.select(svg).append('g').attr('class', 'seats');
		lines = d3.select(svg).append('g').attr('class', 'lines');
		path = d3.select(svg).append('g').attr('class', 'path');

		const seatTypes = [
			{ id: 'seat-a', class: 'seat seat-a', content: 'A' },
			{ id: 'seat-b', class: 'seat seat-b', content: 'B' },
			{ id: 'seat-c', class: 'seat seat-c', content: 'C' }
		];

		// const drag = d3
		// 	.drag()
		// 	.subject((event) => event.subject)
		// 	.on('start', dragstarted)
		// 	.on('drag', dragged)
		// 	.on('end', dragended);

		d3.selectAll('.seat-design')
			.data(seatTypes)
			.on('mousedown', (event: any, d: any) => {
				const clonedSeat: d3.Selection<SVGGElement, any, any, any> = seats
					.append('g')
					.datum(d)
					.attr('transform', `translate(${event.x},${event.y})`)
					.attr('data-rotation', '0')
					.call(d3.drag().on('drag', (event) => dragged(event, clonedSeat)) as any);

				clonedSeat
					.append('rect')
					.attr('width', seatWidth)
					.attr('height', seatHeight)
					// fill color
					.attr('fill', `#${Math.floor(Math.random() * 16777215).toString(16)}`)
					.attr('rx', 5)
					.attr('ry', 5);

				clonedSeat
					.append('text')
					.attr('x', seatWidth / 2)
					.attr('y', seatHeight / 2)
					.attr('text-anchor', 'middle')
					.attr('dominant-baseline', 'middle')
					// cursor: grabbing;
					.attr('style', 'cursor: grabbing;')
					.text(d.content);

				// clonedSeat
				// 	.append('circle')
				// 	.attr('class', 'rotate-handle')
				// 	.attr('cx', seatWidth / 2)
				// 	.attr('cy', 0)
				// 	.attr('r', 5)
				// 	.attr('fill', 'red')
				// 	.call(d3.drag().on('drag', (event) => rotate(event, clonedSeat)) as any);

				clonedSeat
					.append('circle')
					.attr('class', 'resize-handle')
					.attr('cx', seatWidth)
					.attr('cy', seatHeight)
					.attr('r', 5)
					.attr('fill', 'green')
					.call(d3.drag().on('drag', (event) => resize(event, clonedSeat)) as any);

				clonedSeat
					.append('circle')
					.attr('class', 'resize-handle')
					.attr('cx', 0)
					.attr('cy', 0)
					.attr('r', 5)
					.attr('fill', 'red')
					.call(
						d3
							.drag()
							.subject(() => clonedSeat.node()!)
							.container(() => seats.node()!)
							.on('drag', (event: any) => rotate(event, clonedSeat)) as any
					);
				// if (clonedSeat != null) {
				// 	clonedSeat.node().appendChild(rotationIndicator.node());
				// }
			});

		function dragstarted(event: any) {
			console.log('dragstarted');
			// d3.select(event.sourceEvent.target).raise();
		}

		function dragged(event: any, seatGroup: d3.Selection<SVGGElement, any, any, any>) {
			const target = d3.select(event.subject);

			const currentRotation = parseInt(seatGroup.attr('data-rotation') || '0');
			const halfCurrentWidth = parseInt(seatGroup.select('rect').attr('width')) / 2;
			const halfCurrentHeight = parseInt(seatGroup.select('rect').attr('height')) / 2;
			seatGroup.attr(
				'transform',
				`translate(${event.x - halfCurrentWidth},${
					event.y - halfCurrentHeight
				}) rotate(${currentRotation},${seatWidth / 2},${seatHeight / 2})`
			);
			// seatGroup.attr('transform', `translate(${event.x},${event.y}) `);
		}

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

		function dragended(event: any, d: any) {
			// You can add additional logic here when the dragging ends
			// const target = event.sourceEvent.target as HTMLElement;
			// if (target.classList.contains('rotate-handle')) {
			// 	rotate(event.sourceEvent as any, d3.select(event.subject));
			// } else if (target.classList.contains('resize-handle')) {
			// 	resize(event.sourceEvent as any, d3.select(event.subject));
			// }
		}
	});

	function rotate(event: any, prevSeatGroupb: d3.Selection<SVGGElement, any, any, any>) {
		const currentSeatGroup = d3.select(event.subject);
		const mouseX = event.x;
		const mouseY = event.y;

		const transform = currentSeatGroup.attr('transform');
		const translateRegex = /translate\(([\d.]+),\s*([\d.]+)\)/;
		const translateMatch = transform.match(translateRegex);
		const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
		const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;

		const bbox = currentSeatGroup.node().getBBox();
		const centerX = translateX + bbox.width / 2;
		const centerY = translateY + bbox.height / 2;

		const dx = mouseX - centerX;
		const dy = mouseY - centerY;
		console.log('centerY', centerY);
		console.log('centerX', centerX);
		const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
		const degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
		console.log('degrees', degrees);
		console.log('dx', dx);
		console.log('dy', dy);
		// the angle is in radians, so we need to convert it to degrees

		console.log('Math.atan2(dy, dx) ', Math.atan2(dy, dx));

		const currentRotation = parseFloat(currentSeatGroup.attr('data-rotation') || '0');
		console.log('currentRotation', currentRotation);
		console.log('angle', angle);
		const deltaAngle = angle - currentRotation;
		console.log('deltaAngle', deltaAngle);

		const newRotation = currentRotation + deltaAngle;

		currentSeatGroup
			.attr('data-rotation', newRotation)
			.attr(
				'transform',
				`translate(${translateX},${translateY}) rotate(${newRotation},${centerX},${centerY})`
			);
	}

	function resize(
		event: d3.D3DragEvent<any, any, any>,
		seatGroup: d3.Selection<SVGGElement, any, any, any>
	) {
		const newWidth = Math.max(20, event.x);
		const newHeight = Math.max(20, event.y);
		seatGroup.select('rect').attr('width', newWidth).attr('height', newHeight);
		seatGroup
			.select('text')
			.attr('x', newWidth / 2)
			.attr('y', newHeight / 2);
		seatGroup.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
	}

	function onMouseDown(event: MouseEvent) {
		if (!isDrawing) {
			isDrawing = true;
			currentPath = `M ${event.offsetX} ${event.offsetY}`; // Start a new path at the mouse down position
		}
	}

	function onMouseMove(event: MouseEvent) {
		if (isDrawing) {
			currentPath += ` L ${event.offsetX} ${event.offsetY}`; // Add a line segment to the current path for each mouse move event
			path
				.selectAll('path')
				.data([...paths, currentPath]) // Spread the existing paths and add the current path
				.join('path')
				.attr('d', (d: any) => d)
				.attr('fill', 'none')
				.attr('stroke', 'black')
				.attr('stroke-width', 2);
		}
	}

	function onMouseUp(event: MouseEvent) {
		if (isDrawing) {
			currentPath += ` Z`; // Close the path when the mouse button is released
			paths.push(currentPath); // Add the current path to the paths array

			path
				.selectAll('path')
				.data(paths) // Update the data with the paths array
				.join('path')
				.attr('d', (d: any) => d)
				.attr('fill', 'rgba(0, 0, 0, 0.1)') // Set fill color for the closed shape
				.attr('stroke', 'black')
				.attr('stroke-width', 2);

			isDrawing = false;
			currentPath = '';
		}
	}

	function onEscKey(event: KeyboardEvent) {
		console.log('esc');
		if (event.key === 'Escape') {
			isDrawing = false;
			currentLine = null;
		}
	}

	// window.addEventListener('keydown', onEscKey);

	// Remove the event listener when the component is destroyed
</script>

<svelte:window on:keydown={onEscKey} />
<div class="flex">
	<div class="flex flex-col space-y-2 p-4">
		{#each [{ id: 'seat-a', class: 'seat seat-a', content: 'A' }, { id: 'seat-b', class: 'seat seat-b', content: 'B' }, { id: 'seat-c', class: 'seat seat-c', content: 'C' }] as seat}
			<div class="seat-design p-2 bg-gray-200 rounded cursor-move">
				<svg
					class={seat.class}
					xmlns="http://www.w3.org/2000/svg"
					width={seatWidth}
					height={seatHeight}
				>
					<rect width="100%" height="100%" rx="5" ry="5" />
					<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="text-sm">
						{seat.content}
					</text>
				</svg>
			</div>
		{/each}
	</div>
	<div class="flex-1 relative">
		<svg
			on:mousedown={onMouseDown}
			on:mousemove={onMouseMove}
			on:mouseup={onMouseUp}
			on:mouseleave={onMouseUp}
			bind:this={svg}
			class="w-full h-full border"
			xmlns="http://www.w3.org/2000/svg"
		/>
	</div>
</div>

<style>
	.cursor-move {
		cursor: move;
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
