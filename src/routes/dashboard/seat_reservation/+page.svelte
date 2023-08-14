<script lang="ts">
	import { onMount } from 'svelte';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
	import seatReservation from './reservationStore';
	import { getValueFromArrayByString } from '$lib/utils/getValueFromArrayByString';
	export let data;

	let informationData = [
		{
			header: 'company name',
			field: 'company.company_name'
		},
		{
			header: 'exhibition name',
			field: 'exhibition.exhibition_languages[0].title'
		},

		{
			header: 'created at',
			field: 'created_at'
		},
		{
			header: 'status',
			field: 'status'
		}
	];
	let currentPage = 1;
	const pageSize = 8;

	let totalPages = 1;

	onMount(async () => {
		await seatReservation.getSeatReservations(data.supabase);
	});
	async function goToPage(page: any) {
		currentPage = page;
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- table data -->
	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							{#each informationData as data}
								<th
									class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
								>
									<div class="flex items-center gap-2">
										<span>{data.header}</span>
									</div>
								</th>
							{/each}
						</tr>
					</thead>

					<tbody>
						{#each $seatReservation as item}
							<tr>
								{#each informationData as data}
									{#if data.field === 'status'}
										<td
											class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 flex justify-center items-center"
										>
											<span
												class={`flex justify-center text-gray-700 dark:text-gray-200 font-semibold w-3/4 py-2 rounded-3xl `}
												style={`background-color: var(--${getValueFromArrayByString(data, item)})`}
												>{getValueFromArrayByString(data, item)}</span
											>
										</td>
									{:else}
										<td
											class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											<span
												class="flex justify-center text-gray-700 dark:text-gray-200 font-semibold"
												>{getValueFromArrayByString(data, item)}</span
											>
										</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
