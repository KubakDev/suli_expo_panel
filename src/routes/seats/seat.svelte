<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let svg: SVGSVGElement;
	const seatWidth = 50;
	const seatHeight = 50;

	onMount(() => {
		const seats = d3.select(svg).append('g').attr('class', 'seats');

		const seatTypes = [
			{ id: 'seat-a', class: 'seat seat-a', content: 'A' },
			{ id: 'seat-b', class: 'seat seat-b', content: 'B' },
			{ id: 'seat-c', class: 'seat seat-c', content: 'C' }
		];
		let isDragging = false;
		// let clonedSeat: d3.Selection<SVGGElement, any, any, any> | null = null;

		const drag = d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
		const aaa = d3.selectAll('.seat-design');
		console.log(aaa);

		d3.selectAll('.seat-design')
			.data(seatTypes)
			.on('mousedown', (event: any, d: any) => {
				const clonedSeat: d3.Selection<SVGGElement, any, any, any> = seats
					.append('g')
					.datum(d)
					.attr('class', d.class)
					.attr('transform', `translate(${event.x},${event.y})`)
					.call(drag.subject(() => clonedSeat.node()!).container(() => seats.node()!) as any);

				clonedSeat
					.append('rect')
					.attr('width', seatWidth)
					.attr('height', seatHeight)
					.attr('rx', 5)
					.attr('ry', 5);

				clonedSeat
					.append('text')
					.attr('x', seatWidth / 2)
					.attr('y', seatHeight / 2)
					.attr('text-anchor', 'middle')
					.attr('dominant-baseline', 'middle')
					.text(d.content);
			});

		function dragstarted(event: any) {
			console.log('dragstarted');
			// d3.select(event.sourceEvent.target).raise();
		}

		function dragged(event: any, d: any) {
			// if (clonedSeat) {
			// 	clonedSeat.attr('transform', `translate(${event.x},${event.y})`);
			// }
			console.log('dragged', event.subject);
			d3.select(event.subject).attr('transform', `translate(${event.x},${event.y})`);
		}

		function dragended(event: any, d: any) {
			console.log('drag ended', d);

			// You can add additional logic here when the dragging ends
		}
	});

	function rotate(event: MouseEvent) {
		const seat = event.target as HTMLElement;
		const seatGroup = d3.select(seat.parentElement);
		const rotation = parseInt(seatGroup.attr('data-rotation') || '0') + 45;
		seatGroup
			.attr('data-rotation', rotation)
			.attr('transform', `rotate(${rotation},${event.x},${event.y})`);
	}

	function resize(event: MouseEvent) {
		const seat = event.target as HTMLElement;
		const seatGroup = d3.select(seat.parentElement);
		const newWidth = Math.max(20, event.x);
		const newHeight = Math.max(20, event.y);
		seatGroup.select('rect').attr('width', newWidth).attr('height', newHeight);
		seatGroup
			.select('text')
			.attr('x', newWidth / 2)
			.attr('y', newHeight / 2);
	}
</script>

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
		<svg bind:this={svg} class="w-full h-full border" xmlns="http://www.w3.org/2000/svg" />
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
</style>
