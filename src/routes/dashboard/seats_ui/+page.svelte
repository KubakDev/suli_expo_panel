<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { SeatLayoutModel } from '../seats/seatLayoutStore';
	export let data: PageData;

	$: ({ supabase, session } = data);
	let svg: SVGSVGElement;
	let selectedAreaSize: number | undefined;
	let designs: SeatLayoutModel[] | undefined;
	const placeHolder = '#placeHolderSeatDesign';
	const a = '#aaaab';
	// let supabase: SupabaseClient<any, 'public', any> | null;

	async function getData() {
		if (!supabase) return;
		const seatsData = await supabase.from('seat_layout').select('*');
		console.log(seatsData);
		designs = seatsData.data?.map((seat) => {
			return seat as SeatLayoutModel;
		});
	}
	onMount(async () => {
		getData();
	});

	function openSeatDesignEditor(design: any) {}
</script>

<div class="flex justify-center">
	<div class="px-4 grid grid-cols-3 gap-4">
		{#if designs}
			{#each designs as design}
				<div on:click={() => openSeatDesignEditor(design)}>
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
