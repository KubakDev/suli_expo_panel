<script lang="ts">
	import { onMount } from 'svelte';
	import { supabaseStore } from '../../../stores/supabaseStore';
	import {
		seatLayoutStore,
		type SeatDesignModel,
		type SeatLayoutModel
	} from '../seats/seatLayoutStore';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { goto } from '$app/navigation';
	import * as d3 from 'd3';
	import { Card } from 'flowbite-svelte';
	let svg: SVGSVGElement;
	let selectedAreaSize: number | undefined;
	let isLoaded = false;
	let designs: SeatLayoutModel[] | undefined;
	const placeHolder = '#placeHolderSeatDesign';
	const a = '#aaaab';
	let supabase: SupabaseClient<any, 'public', any> | null;

	async function getData() {
		if (!supabase) return;
		const seatsData = await supabase.from('seat_layout').select('*,seats(*)');
		console.log(seatsData);
		designs = seatsData.data?.map((seat) => {
			return seat as SeatLayoutModel;
		});
	}
	onMount(async () => {
		supabase = $supabaseStore;
		console.log('supabase', supabase);
		getData();
		// console.log(seatsData);
		// seats = d3.select(svg).append('isLoaded = true;
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

	async function showSelectedDesign(design: SeatLayoutModel) {
		// show seat desing inside svg
		console.log(design);
		d3.select(placeHolder).selectAll('g').remove();
		selectedAreaSize = design.aspect_ratio;
		await new Promise((resolve) => setTimeout(resolve, 500));
		const container = d3.select(a);
		// get contianer width and height
		const htmlElemtn = container.node() as HTMLElement;
		console.log('htmlElemtn', htmlElemtn);

		// const containerWidth = htmlElemtn.clientWidth;
		// const containerHeight = htmlElemtn.clientHeight;
		// console.log('containerHeight', containerHeight);
		// console.log('containerWidth', containerWidth);
		// return;
		// show seat design inside svg
		let seats = [];
		// for (let i = 0; i < design.seats.length; i++) {
		// 	const seat = design.seats[i];
		// 	const seatWidth = (seat.width! / 100) * containerWidth;
		// 	const seatHeight = (seat.height! / 100) * containerHeight;

		// 	const seatX = (seat.x! / 100) * containerWidth;
		// 	const seatY = (seat.y! / 100) * containerHeight;

		// 	const seatDesign = d3
		// 		.select(placeHolder)
		// 		.append('g')
		// 		// add random class
		// 		.datum('')
		// 		.attr(
		// 			'transform',
		// 			`translate(${seatX},${seatY}) rotate(${seat.rotation}, ${seatWidth / 2},  ${
		// 				seatHeight / 2
		// 			})`
		// 		)
		// 		.attr('data-rotation', '0')
		// 		.on('click', (event: any, d: any) => {});

		// 	if (seat.image_url) {
		// 		createRectWithImageBackground(seat, seatDesign, seatWidth, seatHeight);
		// 	} else {
		// 		seatDesign
		// 			.append('rect')
		// 			.attr('width', seatWidth)
		// 			.attr('height', seatHeight)
		// 			// fill color
		// 			.attr('fill', seat.fill_color!)
		// 			.attr('stroke', seat.stroke_color!)
		// 			.attr('stroke-width', seat.stroke_width!)
		// 			.attr('rx', seat.border_radius || 0)
		// 			.attr('ry', seat.border_radius || 0)
		// 			.on('click', function () {});
		// 	}
		// }

		seatLayoutStore.setItem(design);
		goto('/dashboard/seats');
	}

	function createRectWithImageBackground(
		seat: SeatDesignModel,
		clonedSeat: d3.Selection<SVGGElement, any, any, any>,
		seatWidth: number,
		seatHeight: number
	) {
		// Create a pattern and set the image as its background
		// generate random id
		const randomId = Math.random().toString(36).substring(7);
		const pattern = clonedSeat
			.append('pattern')
			.attr('id', 'image-pattern' + '-' + randomId)
			.attr('patternUnits', 'userSpaceOnUse') // Change patternUnits to userSpaceOnUse
			.attr('width', seatWidth) // Set width and height to match the rect's dimensions
			.attr('height', seatHeight);

		pattern
			.append('image')
			.attr('href', seat.image_url!)
			.attr('width', seatWidth) // Set width and height to match the pattern's dimensions
			.attr('height', seatHeight);

		// Append a rect with the image pattern as its fill
		clonedSeat
			.append('rect')
			.attr('width', seatWidth)
			.attr('height', seatHeight)
			.attr('fill', `url(#image-pattern-${randomId})`)
			.attr('stroke', seat.stroke_color!)
			.attr('stroke-width', seat.stroke_width!)
			.attr('rx', seat.border_radius || 0)
			.attr('ry', seat.border_radius || 0)
			.on('click', function () {});
	}
</script>

<div class="flex justify-center">
	<div class="px-4 grid grid-cols-3 gap-4">
		{#if designs}
			{#each designs as design}
				<div on:click={() => showSelectedDesign(design)}>
					<Card class="w-52 h-28 hover:shadow-sm duration-300 cursor-pointer">
						<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
							{design.name}
						</h5>
					</Card>
				</div>
			{/each}
		{/if}
	</div>
</div>
