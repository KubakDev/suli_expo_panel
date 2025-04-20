<script lang="ts">
	import { onMount } from 'svelte';
	import {
		seatServices,
		getSeatServices, 
	} from '../../../stores/seatServicesStore';
	import { goto } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import type { seatServicesModel } from '../../../models/seatServicesModel';
	// Import Tabler icons
	import {  
		IconGridDots,
		IconArrowUp,
		IconArrowDown,
		IconEdit, 
	} from '@tabler/icons-svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	export let data;
	let items: seatServicesModel[] = [];
	let flag = false;
	let loaded = false;

	async function fetchData() {
		loaded = false;
		await getSeatServices(data.supabase);
		items = $seatServices;
		flag = false;
		loaded = true;
	}

	onMount(fetchData);

	function createSeatServices() {
		goto('/dashboard/create_SeatServices');
	}

	// delete data
	// async function handleDelete(seatServicesId: number) {
	// 	try {
	// 		await deleteSeatService(seatServicesId, data.supabase);

	// 		await fetchData();
	// 	} catch (error) {}
	// }

	// swap column index
	const flipDurationMs = 300;

	function handleDndConsider(e: CustomEvent) {
		items = e.detail.items;
		//
	}

	async function handleDndFinalize(e: CustomEvent) {
		items = e.detail.items;
		flag = true;
		items.forEach((item, index: number) => {
			item.position = index + 1;
		});

		await updatePositions();
		await fetchData(); // Fetch data again after updating positions
		flag = false; // Set flag to false after data is fetched
	}
	let supabase = data.supabase;

	async function updatePositions() {
		for (const item of items) {
			// Update position in table
			const { error } = await supabase
				.from('seat_services')
				.update({ position: item.position })
				.eq('id', item.id);

			if (error) {
			}
		}
	}

	async function swapItems(indexA: number, indexB: number) {
		const tempItem = items[indexA];
		items[indexA] = items[indexB];
		items[indexB] = tempItem;
		flag = true;
		items.forEach((item, index: number) => {
			item.position = index + 1;
		});

		await updatePositions();
		await fetchData(); // Fetch data again after updating positions
		flag = false; // Set flag to false after data is fetched
	}
</script>

{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createSeatServices} />

	<!-- table data -->

	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
					<thead>
						<tr>
							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">
								<div class="flex justify-center items-center gap-2">
									<span>#</span>
								</div>
							</th>
							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">
								<div class="flex items-center gap-2">
								 <span>Thumbnail</span>
								</div>
							</th>
							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">
								<div class="flex items-center gap-2">
								 	<span>Title</span>
								</div>
							</th>
							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">
								<div class="flex items-center gap-2">
								 	<span>Short description</span>
								</div>
							</th>
							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">
								<div class="flex items-center gap-2">
									<IconGridDots size={20} class="text-gray-600 dark:text-gray-300" />
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>

					<tbody
						use:dndzone={{ items, flipDurationMs, dragDisabled: flag }}
						on:consider={handleDndConsider}
						on:finalize={handleDndFinalize}
					>
						{#each items as item, index (item.id)}
							<tr animate:flip={{ duration: flipDurationMs }}>
								<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
									<div class="flex justify-center gap-2">
										<button on:click={() => swapItems(index, index - 1)} disabled={index === 0}>
											<IconArrowUp size={20} class="text-gray-400" />
										</button>
										<button on:click={() => swapItems(index, index + 1)} disabled={index === items.length - 1}>
											<IconArrowDown size={20} class="text-gray-400" />
										</button>
									</div>
								</td>

								<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
									<div class="flex justify-center">
										<img
											class="w-20 h-20 object-cover rounded"
											src={item.icon
												? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${item.icon}`
												: 'https://images.hindustantimes.com/img/2022/08/07/1600x900/cat_1659882617172_1659882628989_1659882628989.jpg'}
											alt=""
										/>
									</div>
								</td>
								{#if item.seat_services_languages}
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.seat_services_languages as lang}
											<div>
												{lang.title?.slice(0, 50)}
											</div>
										{/each}
									</td>
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.seat_services_languages as lang}
											<div>
												{lang.description?.slice(0, 40)}
											</div>
										{/each}
									</td>
								{/if}
								<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell w-32">
									<div class="flex justify-center items-center gap-2">
										<button
											on:click={() => {
												goto(`/dashboard/seatServices/${item.id}`);
											}}
											class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2 items-center"
										>
											Edit
											<IconEdit size={20} class="text-green-500" />
										</button>

										<!-- <DeleteModal itemIdToDelete={item.id} {handleDelete} /> -->
									</div>
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
	tbody {
		cursor: grab;
	}

	/* Apply styles for dragging state */

	tbody {
		width: 50%;
		padding: 0.3em;
		border: 1px solid black;
		overflow: scroll;
		height: 120px;
	}
</style>
