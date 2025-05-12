<script lang="ts">
	import { onMount } from 'svelte';
	import { exhibitions, getData } from '../../../stores/exhibitionStore';
	import { goto } from '$app/navigation';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	// Import Tabler icons
	import { 
		IconGridDots,
		IconArrowUp,
		IconArrowDown,
		IconEdit
	} from '@tabler/icons-svelte'; 
	import InsertButton from '$lib/components/InsertButton.svelte';
	import type { ExhibitionsModel } from '../../../models/exhibitionModel';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;
	let items: ExhibitionsModel[] = [];
	let flag = false;
	let loaded = false;

	async function fetchData() {
		loaded = false;
		await getData(data.supabase);
		items = $exhibitions;

		flag = false;
		loaded = true;
	}
	onMount(fetchData);

	function createExhibition() {
		goto('/dashboard/create_exhibition');
	}

	// delete data
	async function handleDelete(exhibitionId: number) {
		try {
			loaded = false;
			await data.supabase
				.from('exhibition')
				.update({ deleted_status: 'delete' })
				.eq('id', exhibitionId);

			await fetchData();
		} catch (error) {
			loaded = true;
		}
	}

	const flipDurationMs = 300;

	function handleDndConsider(e: CustomEvent) {
		items = e.detail.items;
		//
	}

	async function handleDndFinalize(e: CustomEvent) {
		loaded = false;
		items = e.detail.items;
		flag = true;
		items.forEach((item: any, index: number) => {
			item.position = index + 1;
		});

		await updatePositions();
		await fetchData();
		flag = false;
	}

	let supabase = data.supabase;

	async function updatePositions() {
		for (const item of items) {
			// Update position in table
			const { error } = await supabase
				.from('exhibition')
				.update({ position: item.position })
				.eq('id', item.id);

			if (error) {
			}
		}
	}

	async function swapItems(indexA: number, indexB: number) {
		loaded = false;
		const tempItem = items[indexA];
		items[indexA] = items[indexB];
		items[indexB] = tempItem;
		flag = true;
		items.forEach((item: any, index: number) => {
			item.position = index + 1;
		});

		await updatePositions();
		await fetchData();
		flag = false;
	}
</script>
	{#if !loaded}
				<div class="flex justify-center items-center h-screen">
					<Spinner size="h-16 w-16" color="border-gray-500" />
				</div>
				{:else}
<div class="max-w-screen-2xl mx-auto py-10 bg-white dark:bg-[#222831]">
	<!-- insert new data -->
	<InsertButton insertData={createExhibition} />

	<!-- table data -->

	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded-lg">
			<div class="min-w-full table-responsive">
			
				<table class="min-w-full border-collapse border border-gray-200 dark:border-gray-800">
					<thead>
						<tr>
							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#2c333d] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-800 table-cell w-10">
								<div class="flex justify-center items-center gap-2">
									<span>#</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#2c333d] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-800 table-cell w-10">
								<div class="flex justify-center items-center gap-2">
									<span>sort</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#2c333d] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
								 <span>Thumbnail</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#2c333d] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
								 <span>Title</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#2c333d] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
								 <span>Short description</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#2c333d] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-800 table-cell">
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
								<td class="p-3 bg-gray-10 dark:bg-[#323a45] border border-gray-200 dark:border-gray-800 table-cell">
									<span class="flex justify-center text-gray-700 dark:text-gray-200 font-semibold"
										>{index + 1}</span
									>
								</td>
								<td class="p-3 bg-gray-10 dark:bg-[#323a45] border border-gray-200 dark:border-gray-800 table-cell">
									<span class="flex justify-center text-gray-700 dark:text-gray-200 font-semibold">
										<button on:click={() => swapItems(index, index - 1)} disabled={index === 0}>
											<IconArrowUp size={20} class="text-gray-400" />
										</button>
										<button on:click={() => swapItems(index, index + 1)} disabled={index === items.length - 1}>
											<IconArrowDown size={20} class="text-gray-400" />
										</button>
									</span>
								</td>
								<td class="p-3 bg-gray-10 dark:bg-[#323a45] border border-gray-200 dark:border-gray-800 table-cell">
									<div class="flex justify-center">
										<img
											class="w-20 h-20 object-cover rounded"
											src={item.thumbnail
												? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${item.thumbnail}`
												: 'https://images.hindustantimes.com/img/2022/08/07/1600x900/cat_1659882617172_1659882628989_1659882628989.jpg'}
											alt=""
										/>
									</div>
								</td>
								{#if item.exhibition_languages}
									<td class="p-3 bg-gray-10 dark:bg-[#323a45] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell">
										{#each item.exhibition_languages as lang}
											<div>
												{lang.title?.slice(0, 50)}
											</div>
										{/each}
									</td>
									<td class="p-3 bg-gray-10 dark:bg-[#323a45] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell">
										{#each item.exhibition_languages as lang}
											<div>
												{lang.description?.slice(0, 40)}
											</div>
										{/each}
									</td>
								{/if}
								<td
									class="p-3 bg-gray-10 dark:bg-[#323a45] border border-gray-200 dark:border-gray-800 table-cell w-32"
								>
									<div class="flex justify-center items-center gap-2">
										<button
											on:click={() => {
												goto(`/dashboard/exhibition/${item.id}`);
											}}
											class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2"
										>
											Edit
											<IconEdit size={20} class="text-green-500" />
										</button>

										<DeleteModal itemIdToDelete={item.id} {handleDelete} />
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
	tr[data-dnd-dragging] {
		background-color: #ce1111;
	}

	tr.dnd-placeholder {
		background-color: #f0f0f0;
	}
</style>
