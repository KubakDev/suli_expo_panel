<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Tooltip } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { SeatLayoutModel } from '../seats/seatLayoutStore';
	import { goto } from '$app/navigation';
	import { SeatsLayoutTypeEnum } from '../../../models/seatsLayoutTypeEnum';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';
	import { IconArrowLeft } from '@tabler/icons-svelte';
	export let data: PageData;

	$: ({ supabase } = data);
	let designs: SeatLayoutModel[] | undefined;
	let seatsAreaFieldsType: SeatLayoutModel[] = [];
    let loaded: boolean = false;
    let exhibitionTypeMap: Map<number, string> = new Map();

   async function getData() {
        loaded = false;
        if (!supabase) return;

        // Fetch seat layout data
        const seatsData = await supabase.from('seat_layout').select('*');

        if (seatsData.data) {
            await Promise.all(
                seatsData.data.map(async (seat) => {
                    if (seat.exhibition) {
                        const exhibitionData = await supabase
                            .from('exhibition')
                            .select('exhibition_type')
                            .eq('id', seat.exhibition)
                            .single();
                        
                         exhibitionTypeMap.set(seat.id, exhibitionData?.data?.exhibition_type || 'N/A');
                    } else {
                         exhibitionTypeMap.set(seat.id, 'N/A');
                    }
                })
            );
        }

        seatsAreaFieldsType = seatsData.data?.filter(seat => seat.type == SeatsLayoutTypeEnum.AREAFIELDS) ?? [];
        designs = seatsData.data?.filter(seat => seat.type !== SeatsLayoutTypeEnum.AREAFIELDS) ?? [];
        loaded = true;
    }


 
	function openSeatDesignEditor(designId: number) {
		goto(`seats_ui/${designId}`);
	}

	function createNewDesign() {
		goto(`seats_ui/create`);
	}
	function getAreaDetail(area?: string) {
		let result = [];
		if (area) {
			try {
				result = JSON.parse(area);
			 } catch (e) {}
		}
		 return result;
	}
 
   async function openSeatInfo(seatId: number) {
      goto(`seats_ui/seatInfo/${seatId}`);
  }

  onMount(async () => {
    getData();
  });
</script>
<div class="p-3">
	<button
		class="flex justify-start items-center text-md gap-2 text-primary hover:transition-opacity duration-300 hover:opacity-90"
		on:click={() => goto('/dashboard')}
	>
	    <IconArrowLeft size={20} />
		<span class="font-semibold">Back</span>
	</button>
</div>

{#if !loaded}
<div class="loading flex justify-center items-center h-screen">
	 <div class="flex justify-center items-center h-screen">
		<Spinner size="h-16 w-16" color="border-gray-500" />  
	</div>
</div>
{:else}
<div class="flex flex-col justify-center items-center w-full py-5">
	<div class="px-4 w-full lg:w-10/12">
		<div class="my-6 flex w-full justify-end">
		  <Button on:click={createNewDesign} class="text-white transition-all duration-300">
		   Add New Seat  
		   </Button>
		</div>
	</div>
	<!-- Seat Design Grid -->
	<div class="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
		{#if designs}
			{#each designs as design}
			<div class="w-full hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-600 hover:border-primary-500">
				<div class="h-40 w-full bg-gray-100 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] cursor-pointer" on:click={() => openSeatDesignEditor(design.id ?? 0)}>
					<img class="object-cover w-full h-full" src={import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL + '/' + design.image_url} />
				</div>
				<div class="p-4 flex flex-col">
					<h5 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-300">{design.name}</h5>
					<p class="text-gray-600 dark:text-gray-400 mb-4"> {design.id &&  exhibitionTypeMap.get(design.id) || 'N/A'}</p>
					<button on:click={() => design.id && openSeatInfo(design.id)} class="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300">
						Update Seat Information
					</button>
					<div class={`h-3 w-3 mt-3 ${design.is_active ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
				</div>
			</div>
			{/each}
		{/if}
	</div>

	<!-- Reservation Table -->
	<div class="w-full max-w-screen-2xl mx-auto my-10 px-4 border-t border-gray-300 dark:border-gray-600 pt-6">
		<div class="flex w-full justify-between items-center mb-6">
			<h1 class="text-lg font-bold text-gray-800 dark:text-gray-300">Reservation by Area</h1>
			<Button on:click={() => goto('seats_ui/reservation_by_area')} class="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-700 transition-all duration-300">
				Add New Area
			</Button>
		</div>
		
		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse dark:border-gray-700">
					<thead>
						<tr>
							{#each ['Name', 'Status', 'Area', 'Exhibition Type', 'Detail'] as header}
								<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
									<div class="flex justify-center items-center gap-2">
										<span>{header}</span>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="text-gray-600 dark:text-gray-300">
						{#each seatsAreaFieldsType as seat}
							<tr>
								<td class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] border border-gray-200 dark:border-gray-700 table-cell">
									{seat.name}
								</td>
								<td class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] border border-gray-200 dark:border-gray-700 table-cell">
									{#if seat.is_active}
										<div class="flex items-center">
											<div class="h-3 w-3 bg-green-500 rounded-full mx-2"></div>
											<span>Active</span>
										</div>
									{:else}
										<div class="flex items-center">
											<div class="h-3 w-3 bg-red-500 rounded-full mx-2"></div>
											<span>Inactive</span>
										</div>
									{/if}
								</td>
								<td class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] border border-gray-200 dark:border-gray-700 table-cell">
									{#each getAreaDetail(seat.areas) as areaDetail}
										<div class="my-3">
											Area: {areaDetail.area} M <span class="mx-4">Quantity: {areaDetail.quantity}</span>
										</div>
									{/each}
								</td>
								<td class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] border border-gray-200 dark:border-gray-700 table-cell">
									{seat.id && exhibitionTypeMap.get(seat.id) || 'N/A'}
								</td>
								<td class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] border border-gray-200 dark:border-gray-700 table-cell">
									<Button on:click={() => goto(`seats_ui/reservation_by_area/${seat.id}`)} class="text-white transition-all duration-300">
										Detail
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
{/if}

<style>
	.table_header {
		padding: 1rem;
		font-weight: bold;
		text-align: left;
		color: #555;
		font-size: 1rem;
		line-height: 1.25rem;
	}
  
	/* Additional styling for smoother transitions and hover effects */
	.hover\:bg-primary-500:hover {
		background-color: var(--color-primary-500, #3b82f6);
	}

	.transition-all {
		transition: all 0.3s ease;
	}
</style>
