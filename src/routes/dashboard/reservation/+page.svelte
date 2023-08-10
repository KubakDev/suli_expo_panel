<script lang="ts">
	import { onMount } from 'svelte';
	import { seatReservation, getData } from '../../../stores/reservationStore';
	import { goto } from '$app/navigation';

	export let data;

	async function fetchData() {
		let result = await getData(data.supabase);
		console.log(result);
		console.log('seatReservation//', $seatReservation);
	}
	onMount(fetchData);

	// async function goToPage(page: number) {
	// 	currentPage = page;
	// 	await fetchData();
	// }

	// // delete data
	// async function handleDelete(newsId: number) {
	// 	try {
	// 		await deleteData(newsId, data.supabase);
	// 		// alert('News deleted successfully!');
	// 		if (currentPage > totalPages) {
	// 			currentPage = totalPages;
	// 		}
	// 		await fetchData();
	// 	} catch (error) {
	// 		console.error('Error deleting news:', error);
	// 	}
	// }
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- table data -->

	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>object id</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>company name</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>company phone_number</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>exhibition type </span>
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
									>
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>

					<tbody>
						{#each $seatReservation as item, index (item.id)}
							<tr>
								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
									<div>
										{item?.object_id}
									</div>
								</td>

								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
									<div>
										{item?.company?.company_name}
									</div>
								</td>

								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
									<div>
										{item?.company?.phone_number}
									</div>
								</td>
								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
									<div>
										{item?.exhibition?.exhibition_type}
									</div>
								</td>

								<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
									<div>
										{item?.status}
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
