<script lang="ts">
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import { supabase } from '../../../supabase';
	let svg: SVGSVGElement;
	let selectedAreaSize: number | undefined;
	let seats: d3.Selection<SVGGElement, unknown, null, undefined>;
	let isLoaded = false;

	onMount(async () => {
		const seatsData = await supabase.from('seats').select('*').eq('seat_layout',8);
		console.log(seatsData);
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
</script>

<div>
	<div class=" relative w-full" style={`padding-bottom: calc(${selectedAreaSize} * 100%);`}>
		<svg
			bind:this={svg}
			class="absolute top-0 left-0 w-full h-full border-gray border svgPlaceholder"
			xmlns="http://www.w3.org/2000/svg"
		/>
	</div>
</div>
