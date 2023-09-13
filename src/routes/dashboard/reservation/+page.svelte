<script lang="ts">
	import { onMount } from 'svelte';
	import {
		seatReservation,
		getReservationData,
		updateData,
		seatReservationTotalCount
	} from '../../../stores/reservationStore';
	import { ReservationStatusEnum } from '../../../models/reservationEnum';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { Button, Dropdown, Label } from 'flowbite-svelte';
	import { Icon } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';

	export let data;
	let selectedExhibition: number | undefined;
	let p_company_name: string | undefined;
	let p_phone_number: string | undefined;
	let p_type: string | undefined;
	let p_email: string | undefined;
	let searchQuery: string = '';
	let searchField: string | null = null;
	let isOptionSelected: boolean = false;
	let currentPage: number = 1;
	const pageSize: number = 4;
	let totalItems: any;
	let totalPages = 1;

	$: {
		console.log('//', $seatReservationTotalCount);
	}

	async function fetchReservationData() {
		let result: any = await getReservationData(
			data.supabase,
			currentPage,
			pageSize,
			selectedExhibition,
			p_company_name,
			p_phone_number,
			p_type,
			p_email
		);
		// console.log($seatReservation);
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
		} catch (error) {
			console.error(error);
		}
	};

	onMount(fetchData);

	function filterByExhibition() {
		if (selectedExhibition) {
			const selected = exhibitionData.find((item) => item.id === selectedExhibition);
			if (selected) {
				selectedExhibition = selected.id;
			}
		} else {
			selectedExhibition = null;
		}
		currentPage = 1;
		fetchReservationData();
	}

	//create checkboxes
	const options = ['company name', 'company phoneNumber', 'company email'];
	let checked: any = {};

	function selectOneCheckbox(index: number) {
		const option = options[index];

		// Reset values to their default states
		p_company_name = undefined;
		p_phone_number = undefined;
		p_type = undefined;
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
		p_type = undefined;
		p_email = undefined;
		searchQuery = '';
		isOptionSelected = false;
		for (const opt of options) {
			checked[opt] = false;
		}
		fetchReservationData();
	}

	async function goToPage(page: number) {
		currentPage = page;
		await fetchReservationData();
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<div class="py-5 px-4 lg:px-0 flex justify-end gap-5">
		<!-- filtering by exhibition -->
		<div class="mb-6 w-44 flex flex-col">
			<select
				class="font-medium text-center text-base hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
				id="type"
				name="type"
				bind:value={selectedExhibition}
				on:change={filterByExhibition}
			>
				<option value={null} class="bg-[#e9ecefd2] dark:bg-gray-100">All Exhibitions</option>
				{#each exhibitionData as item (item.id)}
					<option value={item.id} class="bg-[#e9ecefd2] dark:bg-gray-100"
						>{item.exhibition_type}</option
					>
				{/each}
			</select>
		</div>
		<!-- filtering by company -->
		<div>
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
						svg
					{:else}
						<button on:click={clearFilters} class="">svg</button>
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
									<span>#</span>
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
							{#each $seatReservation as reservation}
								<tr>
									<td
										class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell w-10"
									>
										<div>
											{reservation.object_id}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{#each reservation.companies as item}
												<div><li>{item.company_name}</li></div>
											{/each}
										</div>
									</td>

									<td
										class="max-w-screen-sm p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>
											{#each reservation.comments as comment}
												<div><li>{comment}</li></div>
											{/each}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{reservation.exhibitions[0].exhibition_type}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div class="text-center">
											<button
												on:click={() => {
													goto(`/dashboard/reservation/detail/${reservation.object_id}`);
												}}
												class="dark:text-gray-400 hover:underline"
												>View
											</button>
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
