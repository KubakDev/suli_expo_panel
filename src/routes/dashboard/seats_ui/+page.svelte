<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Card } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { SeatLayoutModel } from '../seats/seatLayoutStore';
	import { goto } from '$app/navigation';
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

	function openSeatDesignEditor(design: any) {
		goto(`seats_ui/${design.id}`);
	}

	function creatNewSeatDesign() {
		goto(`seats_ui/create`);
	}
</script>

<div class="flex flex-col justify-start items-center bg-secondary w-full pt-10">
	<div>
		<Button on:click={creatNewSeatDesign}>
			<a>Create New Seat Design</a>
		</Button>
	</div>

	<div class="px-4 grid grid-cols-3 gap-4">
		{#if designs}
			{#each designs as design}
				<div
					on:click={() => openSeatDesignEditor(design)}
					class="w-52 hover:shadow-sm duration-300 cursor-pointer h-40 flex flex-col p-0 border rounded-2xl border-gray-300"
				>
					<div class="h-20 w-full bg-black rounded-tl-2xl rounded-tr-2xl">
						<img
							class="object-cover w-full h-full"
							src={import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL + '/' + design.image_url}
						/>
					</div>
					<h5
						class=" font-bold tracking-tight text-white bg-secondary flex-1 flex justify-start items-start p-2 rounded-bl-2xl rounded-br-2xl"
					>
						{design.name}
					</h5>
				</div>
			{/each}
		{/if}
	</div>
</div>
