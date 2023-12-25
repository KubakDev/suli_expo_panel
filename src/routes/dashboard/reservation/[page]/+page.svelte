<script lang="ts">
	
	import {
		getReservationDataByDependEdited,
		getReservationDataByDependStatus
	} from '../../../../stores/reservationStore';
	import { onMount } from 'svelte';
	import {
		seatReservation,
		getReservationData,
		seatReservationTotalCount
	} from '../../../../stores/reservationStore';
	import { ReservationStatusEnum } from '../../../../models/reservationEnum';
	import type { ExhibitionModel } from '../../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../../stores/exhibitionTypeStore';
	import { Button, Dropdown, Label } from 'flowbite-svelte';
	import { Icon } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import { page } from '$app/stores';

	export let data;
	let p_company_name: string | undefined;
	let p_phone_number: string | undefined;
	let p_email: string | undefined;
	let searchQuery: string = '';
	let searchField: string | null = null;
	let isOptionSelected: boolean = false;
	let currentPage: number = 1;
	const pageSize: number = 15;
	let totalItems: number;
	let totalPages = 1;
	let selectedStatus: ReservationStatusEnum | undefined;
	let selectedEdited: boolean | undefined = undefined;
	let selectedExhibition: number | undefined = undefined;

	//pagination number with url
	onMount(() => {
		currentPage = +$page.params.page;
		fetchData();
	});

	async function filterByExhibition() {
		if (selectedExhibition) {
			const selected = exhibitionData.find((item) => item.id === selectedExhibition);
			if (selected) {
				selectedExhibition = selected.id;
			}
		} else {
			selectedExhibition = undefined;
			currentPage = 1;
		}

		sessionStorage.setItem('selectedExhibition', selectedExhibition?.toString() || '');
		await fetchReservationData();
		currentPage = 1;
	}

	async function fetchReservationDataByStatus() {
		if (selectedStatus !== undefined) {
			await getReservationDataByDependStatus(data.supabase, selectedStatus, currentPage, pageSize);
			totalItems = $seatReservationTotalCount;
			totalPages = Math.ceil(totalItems / pageSize);
		} else {
			await fetchReservationData();
			clearAllFilters();
			// currentPage = 1;
		}

		sessionStorage.setItem('selectedStatus', selectedStatus || '');
		sessionStorage.setItem('currentPage', currentPage.toString());
	}

	async function fetchReservationDataByEdited() {
		if (selectedEdited !== undefined) {
			await getReservationDataByDependEdited(data.supabase, selectedEdited, currentPage, pageSize);
		} else {
			await fetchReservationData();
			clearAllFilters();
			// currentPage = 1;
		}

		totalItems = $seatReservationTotalCount;
		totalPages = Math.ceil(totalItems / pageSize);

		sessionStorage.setItem('selectedEdited', selectedEdited?.toString() ?? 'undefined');
		sessionStorage.setItem('currentPage', currentPage.toString());
	}

	async function goToPage(page: number) {
		currentPage = page;
		// Fetch data
		if (selectedStatus !== undefined) {
			await fetchReservationDataByStatus();
		} else if (selectedEdited !== undefined) {
			await fetchReservationDataByEdited();
		} else {
			await fetchReservationData();
		}

		goto(`/dashboard/reservation/${currentPage}`); // Update the URL
	}

	async function fetchReservationData() {
		await getReservationData(
			data.supabase,
			currentPage,
			pageSize,
			selectedExhibition,
			p_company_name,
			p_phone_number,
			p_email
		);
		if ($seatReservation && $seatReservation[0] && $seatReservation[0]?.total_count) {
			totalItems = $seatReservation[0]?.total_count;
			totalPages = Math.ceil(totalItems / pageSize);
		}
	}

	onMount(fetchReservationData);

	let exhibitionData: ExhibitionModel[] = [];

	const fetchData = async () => {
		try {
			exhibitionData = await getDataExhibition(data.supabase);

			let uniqueTypes = exhibitionData.filter((item, index, array) => {
				return !array
					.slice(0, index)
					.some((prevItem) => prevItem.exhibition_type === item.exhibition_type);
			});
			exhibitionData = uniqueTypes;
		} catch (error) {}
	};

	onMount(fetchData);

	//create checkboxes
	const options = ['company name', 'company phoneNumber', 'company email'];
	let checked: any = {};

	function selectOneCheckbox(index: number) {
		const option = options[index];

		// Reset values to their default states
		p_company_name = undefined;
		p_phone_number = undefined;
		p_email = undefined;

		// Then set the value for the selected option
		for (const opt of options) {
			checked[opt] = false;
		}
		checked[option] = true;

		switch (option) {
			case 'company name':
				searchField = 'companyNameField';
				break;
			case 'company phoneNumber':
				searchField = 'phoneNumberField';
				break;
			case 'company email':
				searchField = 'emailField';
				break;
			default:
				searchField = null;
		}

		isOptionSelected = true;
	}

	async function filterByCompany() {
		switch (searchField) {
			case 'companyNameField':
				p_company_name = searchQuery;
				break;
			case 'phoneNumberField':
				p_phone_number = searchQuery;
				break;
			case 'emailField':
				p_email = searchQuery;
				break;
			default:
				break;
		}

		await fetchReservationData();
		currentPage = 1;
	}

	function clearFilters() {
		p_company_name = undefined;
		p_phone_number = undefined;
		p_email = undefined;
		searchQuery = '';
		isOptionSelected = false;
		for (const opt of options) {
			checked[opt] = false;
		}
		fetchReservationData();
	}

	function checkIfEdited(objectId: number) {
		let reservation = $seatReservation.find((item) => item.object_id == objectId);
		let editedField = reservation?.companies?.find((item) => item.edit === true);
		return editedField ? true : false;
	}

	// create Series  number
	let startingSerialNumber: number = 0;
	$: if (totalItems != null && currentPage != null && pageSize != null) {
		startingSerialNumber = totalItems - (currentPage - 1) * pageSize;
	}

	// clear all filters
	function clearAllFilters() {
		p_company_name = undefined;
		p_phone_number = undefined;
		p_email = undefined;
		searchQuery = '';
		isOptionSelected = false;
		selectedStatus = undefined;
		selectedEdited = undefined;
		selectedExhibition = undefined;

		for (const opt of options) {
			checked[opt] = false;
		}
		currentPage = 1;
		sessionStorage.setItem('currentPage', '1');
		goto('/dashboard/reservation/currentPage=1'); // Update the URL

		// Remove the status and edited filters from session storage
		sessionStorage.removeItem('selectedStatus');
		sessionStorage.removeItem('selectedEdited');
		sessionStorage.removeItem('selectedExhibition');

		fetchReservationData();
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<div class="py-5 px-4 lg:px-0 flex items-center justify-between gap-5">
		<!-- total count -->
		<div
			class=" shadow-none flex justify-start items-start px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 text-sm"
		>
			Showing <span class="font-bold mx-2 dark:text-gray-200"> {totalItems}</span> Results for reservation
		</div>
		<!-- filtering -->
		<div class="flex flex-col lg:flex-row justify-end items-center gap-2">
			<!-- clear All filters  -->
			<div class="w-44 flex flex-col justify-end">
				<button
					class="text-center font-medium focus:ring-4 focus:outline-none inline-flex items-center justify-center px-5 py-2 tetx-xl bg-gray-200 border border-gray-300 dark:text-gray-900 dark:bg-[#e0e1dd] dark:hover:bg-gray-300 focus:ring-gray-300 dark:focus:ring-gray-900 rounded"
					on:click={clearAllFilters}
				>
					Clear Filter
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="red"
						class="w-6 h-6 ml-2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- filtering by new_edit  -->
			<div class="w-44 flex flex-col justify-end">
				<select
					class="cursor-pointer font-medium text-center text-base hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
					bind:value={selectedEdited}
					on:change={fetchReservationDataByEdited}
				>
					<option value={undefined} class="bg-[#e9ecefd2] dark:bg-gray-100">All Data</option>
					<option value={true} class="bg-[#e9ecefd2] dark:bg-gray-100">New Edits</option>
					<option value={false} class="bg-[#e9ecefd2] dark:bg-gray-100">No New Edits</option>
				</select>
			</div>

			<!-- filtering by status  -->
			<div class="w-44 flex flex-col justify-end">
				<select
					class="cursor-pointer font-medium text-center text-base hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
					bind:value={selectedStatus}
					on:change={fetchReservationDataByStatus}
				>
					<option value={undefined} class="bg-[#e9ecefd2] dark:bg-gray-100">All Status</option>
					<option
						value={ReservationStatusEnum.PENDING}
						class="bg-[#e9ecefd2] dark:bg-gray-100 uppercase text-yellow-400 font-semibold"
						>{ReservationStatusEnum.PENDING}</option
					>
					<option
						value={ReservationStatusEnum.ACCEPT}
						class="bg-[#e9ecefd2] dark:bg-gray-100 uppercase text-green-600 font-semibold"
						>{ReservationStatusEnum.ACCEPT}</option
					>
					<option
						value={ReservationStatusEnum.REJECT}
						class="bg-[#e9ecefd2] dark:bg-gray-100 uppercase text-red-600 font-semibold"
						>{ReservationStatusEnum.REJECT}</option
					>
				</select>
			</div>

			<!-- filtering by exhibition -->
			<div class="w-48 flex flex-col justify-end">
				<select
					class="cursor-pointer font-medium text-center text-base hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
					id="type"
					name="type"
					bind:value={selectedExhibition}
					on:change={filterByExhibition}
				>
					<option value={undefined} class="bg-[#e9ecefd2] dark:bg-gray-100">All Exhibitions</option>
					{#each exhibitionData as item (item.id)}
						<option value={item.id} class="bg-[#e9ecefd2] dark:bg-gray-100"
							>{item.exhibition_type}</option
						>
					{/each}
				</select>
			</div>
			<!-- filtering by company -->
			<div class="w-56 flex flex-col justify-end">
				<Button
					class="py-2 font-medium text-center text-base  hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
				>
					Company Information <Icon
						name="chevron-down-solid"
						class="w-3 h-3 ml-2 text-gray-500 dark:text-gray-500   "
					/>
				</Button>
				<Dropdown class="z-40 bg-[#e9ecefd2] dark:bg-gray-100 space-y-3 rounded">
					<div class="flex items-center p-2 text-gray-900">
						<input
							type="search"
							class="mr-2 dark:bg-gray-50 border border-gray-300 dark:border-gray-300 dark:text-gray-900 text-sm rounded-lg focus:ring-gray-200 focus:border-gray-300 block w-48 pl-3 p-2.5 dark:placeholder-gray-400 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							bind:value={searchQuery}
							on:input={filterByCompany}
							on:keyup={filterByCompany}
							placeholder="Search for..."
							disabled={!isOptionSelected}
						/>

						{#if $seatReservation.length > 0}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24px"
								height="24px"
								viewBox="0 0 22 20"
								id="filter"
								><path
									fill="none"
									fill-rule="evenodd"
									stroke="gray"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20 0H0l8 9.46V16l4 2V9.46z"
									transform="translate(1 1)"
								/></svg
							>
						{:else}
							<!-- clear filter  -->
							<button on:click={clearFilters} class="">
								<svg
									width="24px"
									height="24px"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									/><g id="SVGRepo_iconCarrier">
										<g id="Interface / Filter_Off">
											<path
												id="Vector"
												d="M13 4H18.4C18.9601 4 19.2409 4 19.4548 4.10899C19.6429 4.20487 19.7948 4.35774 19.8906 4.5459C19.9996 4.75981 20 5.04005 20 5.6001V6.3448C20 6.58444 20 6.70551 19.9727 6.81942C19.9482 6.92146 19.9072 7.01893 19.8524 7.1084C19.7906 7.20931 19.7043 7.2958 19.5314 7.46875L18 9.00012M7.49961 4H5.59961C5.03956 4 4.75981 4 4.5459 4.10899C4.35774 4.20487 4.20487 4.35774 4.10899 4.5459C4 4.75981 4 5.04005 4 5.6001V6.33736C4 6.58195 4 6.70433 4.02763 6.81942C4.05213 6.92146 4.09263 7.01893 4.14746 7.1084C4.20928 7.20928 4.29591 7.29591 4.46875 7.46875L9.53149 12.5315C9.70443 12.7044 9.79044 12.7904 9.85228 12.8914C9.90711 12.9808 9.94816 13.0786 9.97266 13.1807C10 13.2946 10 13.4155 10 13.6552V18.411C10 19.2682 10 19.6971 10.1805 19.9552C10.3382 20.1806 10.5814 20.331 10.8535 20.3712C11.1651 20.4172 11.5487 20.2257 12.3154 19.8424L13.1154 19.4424C13.4365 19.2819 13.5966 19.2013 13.7139 19.0815C13.8176 18.9756 13.897 18.8485 13.9453 18.7083C14 18.5499 14 18.37 14 18.011V13.6626C14 13.418 14 13.2958 14.0276 13.1807C14.0521 13.0786 14.0926 12.9809 14.1475 12.8915C14.2091 12.7909 14.2952 12.7048 14.4669 12.5331L14.4688 12.5314L15.5001 11.5001M15.5001 11.5001L5 1M15.5001 11.5001L19 15"
												stroke="gray"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</g>
									</g></svg
								></button
							>
						{/if}
					</div>

					{#each options as option, index}
						<div class="option px-4 pb-2 text-gray-900">
							<input
								class="w-4 h-4 bg-gray-100 dark:bg-gray-100 border-gray-300 dark:ring-offset-gray-200 focus:ring-2 mr-2 dark:border-gray-400 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
								type="checkbox"
								name="selectedOptions"
								value={option}
								id="option{index}"
								on:change={() => selectOneCheckbox(index)}
								checked={checked[option]}
							/>
							<label for="option{index}">{option}</label>
						</div>
					{/each}
				</Dropdown>
			</div>
		</div>
	</div>

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
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>object ID</span>
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
									<span>comments</span>
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
								class="w-14 p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
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

					<tbody class="dark:text-gray-300">
						{#if $seatReservation.length > 0}
							{#each $seatReservation as reservation, index}
								<tr>
									<td
										class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell w-10"
									>
										<div>
											{#if startingSerialNumber != null && startingSerialNumber > 0}
												<div>{startingSerialNumber - index}</div>
											{/if}
										</div>
									</td>
									<td
										class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell w-10"
									>
										<div>
											{reservation.object_id}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{#if reservation.company}
												<div><li>{reservation.company?.company_name}</li></div>
											{/if}
										</div>
										<div>
											{#if reservation.companies}
												{#each reservation.companies as item}
													<div><li>{item?.company_name}</li></div>
												{/each}
											{/if}
										</div>
									</td>

									<td
										class="max-w-screen-sm p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>
											{#if reservation?.comment}
												{reservation.comment}
											{/if}
										</div>
										<div>
											{#if reservation.comments}
												{#each reservation.comments as comment}
													<div><li>{comment}</li></div>
												{/each}
											{/if}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{#if reservation?.exhibition}
												{reservation.exhibition?.exhibition_type}
											{/if}
										</div>

										<div>
											{#if reservation?.exhibitions}
												{reservation?.exhibitions[0]?.exhibition_type}
											{/if}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div class="flex gap-1 items-center">
											{#if reservation.object_id && checkIfEdited(reservation.object_id)}
												<div class="h-4 w-4 bg-red-600 rounded-full" />
											{/if}
											<div class="text-center">
												<button
													on:click={() => {
														goto(`/dashboard/reservation/detail/${reservation.object_id}`);
													}}
													class="dark:text-gray-400 hover:underline"
													>View
												</button>
											</div>
										</div>
									</td>
								</tr>
							{/each}
						{:else}
							<p>No data found</p>
						{/if}
					</tbody>
				</table>

				<!-- Add pagination -->
				<!-- <Pagination {currentPage} {totalPages} {goToPage} /> -->
				<Pagination {currentPage} {totalPages} {goToPage} />
			</div>
		</div>
	</div>
</div>
