<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import {
		seatReservation,
		getReservationsForCompany
	} from '../../../../../stores/reservationStore';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import {
		getCompanyDataById,
		companyDetail,
		clearCompanyDetail
	} from '../../../../../stores/companyInfo';
	import { browser } from '$app/environment';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconArrowLeft, IconChevronRight } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	let src = '/notFound.gif';

	const companyId = $page.params.companyId;
	export let data;

	type ServiceTitlesType = {
		[key: number]: string;
	};

	let serviceTitles: ServiceTitlesType = {};
	let serviceTitlesLoaded = false;
	let loading = true;

	onMount(async () => {
		try {
			loading = true;
			await getReservationsForCompany(data.supabase, +companyId);

			await loadServiceTitles();
			serviceTitlesLoaded = true;
		} catch (error) {
			// Handle error
		} finally {
			loading = false;
		}
	});

	async function loadServiceTitles() {
		const serviceIds = new Set();

		$seatReservation.forEach((reservation) => {
			reservation?.services?.forEach((service) => {
				serviceIds.add(JSON.parse(service).serviceId);
			});
		});

		const responses = await Promise.all([...serviceIds].map((id) => getSeat_services(id as number)));
		responses.forEach((response) => {
			serviceTitles[response.id] = response?.data?.map(
				(item) => item.seat_services_languages[0].title
			)[0];
		});
	}

	async function getSeat_services(id: number) {
		let response = await data.supabase
			.from('seat_services')
			.select('*, seat_services_languages(title)')
			.eq('id', id);
		return {
			id,
			...response
		};
	}

	// Function to format a date string as "year month date"
	function formatDate(inputDate: Date | undefined): string {
		if (!inputDate) {
			return '';
		}
		const date = new Date(inputDate);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	// get  company title
	async function findCompanyName() {
		await getCompanyDataById(data.supabase, parseInt(companyId));
		//
	}
	onMount(findCompanyName);

	onDestroy(() => {
		clearCompanyDetail();
	});

	let reservedAreas: any = [];

	onMount(() => {
		if ($seatReservation) {
			reservedAreas = $seatReservation
				.map((item) => {
					if (item.reserved_areas && typeof item.reserved_areas === 'string') {
						return JSON.parse(item.reserved_areas);
					}
					return null;
				})
				.filter((area) => area !== null);
		}
		
	});

	function goBackToPreviewsPage() {
		if (browser) {
			window.history.back();
		}
	}
</script>
 
{#if loading}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="max-w-screen-2xl mx-auto py-10 body-font">
	<div class="container px-5 py-5 mx-auto">
		<!-- Title (BreadCrumb) -->

		<div class="flex justify-start items-center mb-6 text-gray-600 dark:text-gray-300">
				<Breadcrumb aria-label="Breadcrumb">
					<BreadcrumbItem>
						<svelte:fragment slot="icon">
							<IconArrowLeft class="w-4 h-4 -mr-2" />
						</svelte:fragment>
					</BreadcrumbItem>
                <button on:click={goBackToPreviewsPage}>List of Companies</button>
				<BreadcrumbItem>
					<svelte:fragment slot="icon">
						<IconChevronRight class="w-4 h-4" />
					</svelte:fragment>

					{#if $companyDetail}
						<span class="text-gray-500 dark:text-gray-400">
							{$companyDetail?.company_name}
						</span>
					{/if}
				</BreadcrumbItem>
			</Breadcrumb>
		</div>

		{#if $seatReservation && $seatReservation.length > 0}
			<div class="overflow-x-auto rounded shadow-lg">
				<div class="min-w-full table-responsive">
					{#if serviceTitlesLoaded}
						<table class="min-w-full border border-gray-200 dark:border-gray-700">
							<thead>
								<tr class="border border-gray-200 dark:border-gray-700">
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex justify-center items-center gap-2">
											<span>#</span>
										</div>
									</th>

									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>exhibition</span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>Date</span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>comment</span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>status</span>
										</div>
									</th>

									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>service & quantity</span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>reserved area</span>
										</div>
									</th>
								</tr>
							</thead>

							<tbody class="dark:text-gray-300">
								{#each $seatReservation as item, index}
									<tr class="border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a3038]">
										<td
											class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
										>
											<div class="flex justify-center">
												{index + 1}
											</div>
										</td>
										<td
											class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
										>
											<div>{item?.exhibition?.exhibition_type}</div>
										</td>
										<td
											class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
										>
											<div>{formatDate(item.created_at || new Date())}</div>
										</td>

										<td
											class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
										>
											<div>{item?.comments?.[0] || 'No comment'}</div>  
										</td>
										<td
											class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell uppercase"
										>
											<div>
												{#if item.status === ReservationStatusEnum.REJECT}
													<span class="font-semibold text-red-600 dark:text-red-400">{item.status}</span>
												{:else if item.status === ReservationStatusEnum.ACCEPT}
													<span class="font-semibold text-green-600 dark:text-green-400">{item.status}</span>
												{:else if item.status === ReservationStatusEnum.PENDING}
													<span class="font-semibold text-primary-100">{item.status}</span>
												{/if}
											</div>
										</td>

										<td
											class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
										>
											{#if item.services}
												{#each item.services as service}
													<div class="flex justify-center items-center gap-2">
														<div>{serviceTitles[JSON.parse(service).serviceId]}</div>

														<span class="ml-2">( {JSON.parse(service).quantity} )</span>
													</div>
												{/each}
											{/if}
										</td>

										<td
											class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
										>
											{#if item?.reserved_areas && typeof item.reserved_areas === 'string'} 
												{#each JSON.parse(item.reserved_areas) as area}  
													<p>Area: {area.area}, Quantity: {area.quantity}</p>
												{/each}
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="flex justify-center items-center min-h-screen">
							<Spinner size="h-16 w-16" color="border-gray-500" />
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-10">
				<img {src} alt="No data" class="w-64 h-64 mb-4" />
				<p class="text-lg text-gray-600 dark:text-gray-300 font-medium text-center">
					This company hasn't made any reservations yet.
				</p>
			</div>
		{/if}
	</div>
</div>
{/if}

 
