<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Textarea } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { SeatLayoutModel } from '../seats/seatLayoutStore';
	import { goto } from '$app/navigation';
	import { SeatsLayoutTypeEnum } from '../../../models/seatsLayoutTypeEnum';
	export let data: PageData;

	$: ({ supabase } = data);
	let designs: SeatLayoutModel[] | undefined;
	async function getData() {
		if (!supabase) return;
		const seatsData = await supabase.from('seat_layout').select('*');

		seatsData.data =
			seatsData.data?.filter((seat) => {
				return seat.type !== SeatsLayoutTypeEnum.AREAFIELDS;
			}) ?? [];

		console.log(seatsData.data);
		designs = seatsData.data?.map((seat) => {
			return seat as SeatLayoutModel;
		});
	}
	onMount(async () => {
		getData();
	});

	function openSeatDesignEditor(design: any) {
		goto(`seats_ui/${design.id}`);
	}

	function createNewDesign() {
		goto(`seats_ui/create`);
	}
</script>

<div class="flex flex-col justify-start items-center bg-secondary w-full pt-10 min-h-screen">
	<div>
		<Button on:click={createNewDesign}>Create New Seat Design</Button>
	</div>
	<div class="px-4 grid grid-cols-3 gap-4 mt-10">
		{#if designs}
			{#each designs as design}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					on:click={() => openSeatDesignEditor(design)}
					class="w-52 hover:shadow-sm duration-300 cursor-pointer h-40 flex flex-col p-0 border rounded-2xl border-gray-600"
				>
					<div class="h-28 w-full bg-black rounded-tl-2xl rounded-tr-2xl">
						<!-- svelte-ignore a11y-missing-attribute -->
						<img
							class="object-cover w-full h-full rounded-tl-2xl rounded-tr-2xl"
							src={import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL + '/' + design.image_url}
						/>
					</div>
					<div class="flex justify-between px-2 items-center">
						<h5
							class=" font-bold tracking-tight text-white bg-secondary flex-1 flex justify-start items-start p-2 rounded-bl-2xl rounded-br-2xl"
						>
							{design.name}
						</h5>
						<div
							class={`h-3 w-3 ${design.is_active ? 'bg-[#31c48d]' : 'bg-[#cc2827]'} rounded-full`}
						/>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
