<script lang="ts">
	import { onMount } from 'svelte';
	import { service, getData, deleteData } from '../../../stores/serviceStore';
	import { goto } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import DeleteModal from '$lib/components/DeleteModal.svelte';

	//@ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import AiFillEdit from 'svelte-icons-pack/ai/AiFillEdit';
	import InsertButton from '$lib/components/InsertButton.svelte';

	export let data;
	let items: any = [];
	let flag = false;

	async function fetchData() {
		await getData(data.supabase);
		items = $service;
		flag = false;
	}
	onMount(fetchData);

	function createService() {
		goto('/dashboard/create_service');
	}

	// delete data
	async function handleDelete(serviceId: number) {
		try {
			await deleteData(serviceId, data.supabase);
			await fetchData(); // Fetch data again after deletion
		} catch (error) {}
	}

	const flipDurationMs = 300;

	function handleDndConsider(e: any) {
		items = e.detail.items;
		//
	}

	async function handleDndFinalize(e: any) {
		items = e.detail.items;
		flag = true;
		items.forEach((item: any, index: number) => {
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
				.from('service')
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
		items.forEach((item: any, index: number) => {
			item.position = index + 1;
		});

		await updatePositions();
		await fetchData(); // Fetch data again after updating positions
		flag = false; // Set flag to false after data is fetched
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createService} />

	<!-- table data -->
	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell w-10"
							>
								<div class="flex justify-center items-center gap-2">
									<span>#</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell w-10"
							>
								<div class="flex justify-center items-center gap-2">
									<span>sort</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span
										><svg
											width="20px"
											height="20px"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											/><g id="SVGRepo_iconCarrier">
												<path
													d="M21.6809 16.9601L18.5509 9.65013C17.4909 7.17013 15.5409 7.07013 14.2309 9.43013L12.3409 12.8401C11.3809 14.5701 9.5909 14.7201 8.3509 13.1701L8.1309 12.8901C6.8409 11.2701 5.0209 11.4701 4.0909 13.3201L2.3709 16.7701C1.1609 19.1701 2.9109 22.0001 5.5909 22.0001H18.3509C20.9509 22.0001 22.7009 19.3501 21.6809 16.9601Z"
													stroke="#65686c"
													stroke-width="1.5"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
												<path
													opacity="0.4"
													d="M6.9707 8C8.62756 8 9.9707 6.65685 9.9707 5C9.9707 3.34315 8.62756 2 6.9707 2C5.31385 2 3.9707 3.34315 3.9707 5C3.9707 6.65685 5.31385 8 6.9707 8Z"
													stroke="#65686c"
													stroke-width="1.5"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</g></svg
										></span
									>

									<span>Thumbnail</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-start gap-2">
									<span
										><svg
											width="20px"
											height="20px"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											/><g id="SVGRepo_iconCarrier">
												<g id="Menu / Menu_Alt_01">
													<path
														id="Vector"
														d="M12 17H19M5 12H19M5 7H19"
														stroke="#65686c"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													/>
												</g>
											</g></svg
										></span
									>

									<span>Title</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>
										<svg
											width="20px"
											height="20px"
											viewBox="0 0 16 16"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											fill="none"
											stroke="#65686c"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											/><g id="SVGRepo_iconCarrier">
												<path d="m2.75 12.25h10.5m-10.5-4h10.5m-10.5-4h10.5" />
											</g></svg
										></span
									>
									<span>Short description</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span
										><svg
											width="20px"
											height="20px"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											fill="#65686c"
											><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											/><g id="SVGRepo_iconCarrier"
												><path
													d="M9.5 2h-6A1.502 1.502 0 0 0 2 3.5v6A1.502 1.502 0 0 0 3.5 11h6A1.502 1.502 0 0 0 11 9.5v-6A1.502 1.502 0 0 0 9.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 2h-6A1.502 1.502 0 0 0 13 3.5v6a1.502 1.502 0 0 0 1.5 1.5h6A1.502 1.502 0 0 0 22 9.5v-6A1.502 1.502 0 0 0 20.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM9.5 13h-6A1.502 1.502 0 0 0 2 14.5v6A1.502 1.502 0 0 0 3.5 22h6a1.502 1.502 0 0 0 1.5-1.5v-6A1.502 1.502 0 0 0 9.5 13zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 13h-6a1.502 1.502 0 0 0-1.5 1.5v6a1.502 1.502 0 0 0 1.5 1.5h6a1.502 1.502 0 0 0 1.5-1.5v-6a1.502 1.502 0 0 0-1.5-1.5zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5z"
												/><path fill="none" d="M0 0h24v24H0z" /></g
											></svg
										></span
									> <span>Actions</span>
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
								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
									<span class="flex justify-center text-gray-700 dark:text-gray-200 font-semibold"
										>{index + 1}</span
									>
								</td>
								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
									<span class="flex justify-center text-gray-700 dark:text-gray-200 font-semibold">
										<button on:click={() => swapItems(index, index - 1)} disabled={index === 0}>
											<svg
												fill="#d4d2d2"
												height="20px"
												width="20px"
												version="1.1"
												id="Layer_1"
												xmlns="http://www.w3.org/2000/svg"
												xmlns:xlink="http://www.w3.org/1999/xlink"
												viewBox="0 0 512 512"
												enable-background="new 0 0 512 512"
												xml:space="preserve"
												><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
													id="SVGRepo_tracerCarrier"
													stroke-linecap="round"
													stroke-linejoin="round"
												/><g id="SVGRepo_iconCarrier">
													<polygon
														points="245,0 74.3,213.3 202.3,213.3 202.3,512 287.7,512 287.7,213.3 415.7,213.3 "
													/>
												</g></svg
											></button
										>
										<button
											on:click={() => swapItems(index, index + 1)}
											disabled={index === items.length - 1}
										>
											<svg
												fill="#d4d2d2"
												height="20px"
												width="20px"
												version="1.1"
												id="Layer_1"
												xmlns="http://www.w3.org/2000/svg"
												xmlns:xlink="http://www.w3.org/1999/xlink"
												viewBox="0 0 512 512"
												enable-background="new 0 0 512 512"
												xml:space="preserve"
												><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
													id="SVGRepo_tracerCarrier"
													stroke-linecap="round"
													stroke-linejoin="round"
												/><g id="SVGRepo_iconCarrier">
													<polygon
														points="283.7,298.7 283.7,0 198.3,0 198.3,298.7 70.3,298.7 241,512 411.7,298.7 "
													/>
												</g></svg
											></button
										>
									</span>
								</td>
								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
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
								{#if item.service_languages}
									<td
										class="p-3 font- bg-gray-10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell"
									>
										{#each item.service_languages as lang}
											<div>
												{lang.title?.slice(0, 50)}
											</div>
										{/each}
									</td>
									<td
										class="p-3 font- bg-gray-10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell"
									>
										{#each item.service_languages as lang}
											<div>
												{lang.short_description?.slice(0, 40)}
											</div>
										{/each}
									</td>
								{/if}
								<td
									class="p-3 font- bg-gray-10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell w-32"
								>
									<div class="flex justify-center items-center gap-2">
										<button
											on:click={() => {
												goto(`/dashboard/service/${item.id}`);
											}}
											class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2"
										>
											Edit
											<span
												><Icon
													src={AiFillEdit}
													color="green"
													size="20"
													className="custom-icon"
													title="Custom icon params"
												/></span
											>
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

	tbody {
		width: 50%;
		padding: 0.3em;
		border: 1px solid black;
		overflow: scroll;
		height: 120px;
	}
</style>
