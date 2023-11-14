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

	let src = '/notFound.gif';

	const companyId = $page.params.companyId;
	export let data;

	type ServiceTitlesType = {
		[key: number]: string;
	};

	let serviceTitles: ServiceTitlesType = {};
	let serviceTitlesLoaded = false;

	onMount(async () => {
		try {
			await getReservationsForCompany(data.supabase, companyId);

			await loadServiceTitles();
			serviceTitlesLoaded = true;
		} catch (error) {}
	});

	async function loadServiceTitles() {
		const serviceIds = new Set();

		$seatReservation.forEach((reservation) => {
			reservation?.services?.forEach((service) => {
				serviceIds.add(JSON.parse(service).serviceId);
			});
		});

		const responses = await Promise.all([...serviceIds].map((id) => getSeat_services(id)));
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
					if (item.reserved_areas) {
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

<div class="max-w-screen-2xl mx-auto py-10 body-font">
	<div class="container px-5 py-5 mx-auto">
		<!-- Title (BreadCrumb) -->

		<div class="flex justify-start items-start mb-5">
			<Breadcrumb aria-label="Solid background breadcrumb example">
				<BreadcrumbItem>
					<svelte:fragment slot="icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-4 h-4 -mr-2"
						>
							<path
								fill-rule="evenodd"
								d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
								clip-rule="evenodd"
							/>
						</svg>
					</svelte:fragment>
				</BreadcrumbItem>
				<button on:click={goBackToPreviewsPage}>List of Companies</button>
				<BreadcrumbItem>
					<svelte:fragment slot="icon"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-4 h-4"
						>
							<path
								fill-rule="evenodd"
								d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
								clip-rule="evenodd"
							/>
						</svg>
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
			<div class="overflow-x-auto rounded">
				<div class="min-w-full table-responsive">
					{#if serviceTitlesLoaded}
						<table class="min-w-full border-collapse">
							<thead>
								<tr>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="flex justify-start items-center gap-2">
											<span>#</span>
										</div>
									</th>

									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>exhibition</span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>Date</span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>comment</span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="flex items-start gap-2">
											<span>status</span>
										</div>
									</th>

									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>service & quantity </span>
										</div>
									</th>
									<th
										class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="flex items-center gap-2">
											<span>reserved area </span>
										</div>
									</th>
								</tr>
							</thead>

							<tbody>
								{#each $seatReservation as item, index}
									<tr>
										<td
											class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											<div>
												{index + 1}
											</div>
										</td>
										<td
											class="p-3 text-center text-gray-900 dark:text-gray-300 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											<div>{item?.exhibition?.exhibition_type}</div>
										</td>
										<td
											class="p-3 text-center text-gray-900 dark:text-gray-300 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											<div>{formatDate(item.created_at || new Date())}</div>
										</td>

										<td
											class="p-3 max-w-screen-md text-center text-gray-900 dark:text-gray-300 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											<div>{item?.comment}</div>
										</td>
										<td
											class="uppercase p-3 text-center text-gray-900 dark:text-gray-300 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											<div>
												{#if item.status === ReservationStatusEnum.REJECT}
													<span class="font-semibold text-red-600">{item.status}</span>
												{:else if item.status === ReservationStatusEnum.ACCEPT}
													<span class="font-semibold text-green-600">{item.status}</span>
												{:else if item.status === ReservationStatusEnum.PENDING}
													<span class="font-semibold text-primary-100">{item.status}</span>
												{/if}
											</div>
										</td>

										<td
											class="p-3 text-center text-gray-900 dark:text-gray-300 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											{#if item.services}
												{#each item.services as service, serviceIndex}
													<div class="flex">
														<div>{serviceTitles[JSON.parse(service).serviceId]}</div>

														<span class="ml-2">( {JSON.parse(service).quantity} )</span>
													</div>
												{/each}
											{/if}
										</td>

										<td
											class="p-3 max-w-screen-md text-center text-gray-900 dark:text-gray-300 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
										>
											{#each reservedAreas as areas}
												{#each areas as area}
													<p>Area: {area.area}, Quantity: {area.quantity}</p>
												{/each}
											{/each}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="flex justify-center items-center min-h-screen">
							<div class="spinner" />
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex justify-center">
				<!-- No data found -->
				<img {src} alt="img" />
			</div>
		{/if}
	</div>
</div>

<style>
	.spinner {
		border: 8px solid rgba(255, 255, 255, 0.3); /* Light gray */
		border-radius: 50%;
		border-top: 8px solid #333; /* Darker gray */
		width: 70px;
		height: 70px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
