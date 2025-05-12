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
	import { exportToExcel } from '$lib/utils/exportToExcel';
	import { IconGridDots, IconX, IconLayoutGrid, IconFilterCancel } from '@tabler/icons-svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';
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
	let loaded = false;
	
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
			loaded = false;
			exhibitionData = await getDataExhibition(data.supabase);

			let uniqueTypes = exhibitionData.filter((item, index, array) => {
				return !array
					.slice(0, index)
					.some((prevItem) => prevItem.exhibition_type === item.exhibition_type);
			});
			exhibitionData = uniqueTypes;
			loaded = true;
		} catch (error) {
			loaded = true;
		}
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

// Handle export all data
async function handleExport(selectedExhibitionId: number) {
    const { data: result, error } = await data.supabase.rpc('get_all_reserve_data', {
        exhibition_id_param: selectedExhibitionId || null
    });
    if (error) {
        console.error('Error fetching data:', error);
    } else {
        exportToExcel(result);
    }
}

</script>

{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="max-w-screen-2xl mx-auto py-10 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] min-h-screen p-4">
	<div class="py-5 px-4 lg:px-0 flex items-center justify-between gap-5">
		<!-- total count -->
		<div
			class=" shadow-none flex justify-start items-start px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 text-sm"
		>
			Showing <span class="font-bold mx-2 dark:text-gray-200"> {totalItems}</span> Results for reservation
		</div>
		<!-- filtering -->
		<div class="flex flex-col lg:flex-row justify-end items-center gap-2">
			<!-- filtering by new_edit -->
			<div class="w-44">
				<select
					class="cursor-pointer font-medium text-center text-base 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded w-full focus:ring-0 focus:border-gray-300 focus:ring-offset-0"
					bind:value={selectedEdited}
					on:change={fetchReservationDataByEdited}
				>
					<option value={undefined} class="bg-gray-200 dark:bg-gray-700">All Data</option>
					<option value={true} class="bg-gray-200 dark:bg-gray-700">New Edits</option>
					<option value={false} class="bg-gray-200 dark:bg-gray-700">No New Edits</option>
				</select>
			</div>

			<!-- filtering by status -->
			<div class="w-44 relative flex items-center gap-2">
				<select
					bind:value={selectedStatus}
					on:change={fetchReservationDataByStatus}
					class="cursor-pointer font-medium text-center text-base 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded w-full focus:ring-0 focus:border-gray-300 focus:ring-offset-0"
				>
					<option value={undefined} class="bg-gray-200 dark:bg-gray-700">All Status</option>
					<option value={ReservationStatusEnum.PENDING} class="bg-gray-200 dark:bg-gray-700 uppercase text-yellow-400 font-semibold">
						{ReservationStatusEnum.PENDING}
					</option>
					<option value={ReservationStatusEnum.ACCEPT} class="bg-gray-200 dark:bg-gray-700 uppercase text-green-600 font-semibold">
						{ReservationStatusEnum.ACCEPT}
					</option>
					<option value={ReservationStatusEnum.REJECT} class="bg-gray-200 dark:bg-gray-700 uppercase text-red-600 font-semibold">
						{ReservationStatusEnum.REJECT}
					</option>
				</select>
				{#if selectedStatus !== undefined}
					<button
						class="absolute -right-11 w-9 h-9 flex items-center justify-center 
						bg-gray-200 hover:bg-gray-300 text-gray-900 
						dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
						border border-gray-300 dark:border-gray-600 rounded"
						on:click={() => { selectedStatus = undefined; fetchReservationDataByStatus(); }}
						title="Clear filter"
					>
						<IconX size={20} class="text-red-500" />
					</button>
				{/if}
			</div>

			<!-- filtering by exhibition -->
			<div class="w-48 relative flex items-center gap-2">
				<select
					class="cursor-pointer font-medium text-center text-base 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded w-full focus:ring-0 focus:border-gray-300 focus:ring-offset-0"
					bind:value={selectedExhibition}
					on:change={filterByExhibition}
				>
					<option value={undefined} class="bg-gray-200 dark:bg-gray-700">All Exhibitions</option>
					{#each exhibitionData as item (item.id)}
						<option value={item.id} class="bg-gray-200 dark:bg-gray-700">
							{item.exhibition_type}
						</option>
					{/each}
				</select>
				{#if selectedExhibition !== undefined}
					<button
						class="absolute -right-11 w-9 h-9 flex items-center justify-center 
						bg-gray-200 hover:bg-gray-300 text-gray-900 
						dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
						border border-gray-300 dark:border-gray-600 rounded"
						on:click={() => { selectedExhibition = undefined; filterByExhibition(); }}
						title="Clear filter"
					>
						<IconX size={20} class="text-red-500" />
					</button>
				{/if}
			</div>

			<!-- Company Information dropdown -->
			<div class="w-56 flex flex-col justify-end">
				<Button
					class="py-2 font-medium text-center text-base 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded w-full focus:ring-0 focus:border-gray-300 focus:ring-offset-0"
				>
					Company Information 
					<Icon name="chevron-down-solid" class="w-3 h-3 ml-2 text-gray-500 dark:text-gray-400" />
				</Button>
				<Dropdown class="z-40 bg-gray-200 dark:bg-gray-700 space-y-3 rounded">
					<div class="flex items-center p-2">
						<input
							type="search"
							class="mr-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 
							text-gray-900 dark:text-gray-100 text-sm rounded-lg 
							focus:ring-gray-200 focus:border-gray-300 
							dark:focus:ring-gray-600 dark:focus:border-gray-600 
							block w-48 pl-3 p-2.5"
							bind:value={searchQuery}
							on:input={filterByCompany}
							on:keyup={filterByCompany}
							placeholder="Search for..."
							disabled={!isOptionSelected}
						/>

							<IconLayoutGrid size={24} class="text-gray-500 dark:text-gray-400" />
						 
					</div>

					{#each options as option, index}
						<div class="option px-4 pb-2 text-gray-900 dark:text-gray-100">
							<input
								class="w-4 h-4 bg-gray-100 dark:bg-gray-600 
								border-gray-300 dark:border-gray-600 
								focus:ring-2 mr-2 rounded 
								text-primary-600 
								focus:ring-primary-500 dark:focus:ring-primary-600"
								type="checkbox"
								name="selectedOptions"
								value={option}
								id="option{index}"
								on:change={() => selectOneCheckbox(index)}
								checked={checked[option]}
							/>
							<label for="option{index}" class="text-gray-900 dark:text-gray-100">{option}</label>
						</div>
					{/each}
				</Dropdown>
			</div>

			<!-- Action buttons group -->
			<div class="flex items-center gap-2">
				<!-- Clear All button -->
				<button
					class="w-11 h-11 flex items-center justify-center 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
					on:click={clearAllFilters}
					title="Clear All Filters"
				>
					<IconFilterCancel size={24} class="text-red-500" />
				 </button>

				<!-- Export button -->
				<Button 
					class="py-2 px-4 font-medium text-center text-base 
					bg-primary-600 hover:bg-primary-700 text-white 
					dark:bg-primary-600 dark:hover:bg-primary-700 dark:text-white 
					border border-primary-600 dark:border-primary-600 
					rounded focus:ring-0 focus:ring-primary-300 focus:ring-offset-0"
					on:click={() => handleExport(selectedExhibition)}
				>
					Export
				</Button>
			</div>
		</div>
	</div>

	<!-- table data -->
	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded-lg shadow-lg">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell w-10">
								<div class="flex justify-center items-center gap-2">
									<span>#</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
									<span>object ID</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
									<span>company name</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
									<span>comments</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
									<span>exhibition type</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex items-center gap-2">
									<IconLayoutGrid size={20} class="text-gray-600 dark:text-gray-300" />
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>

					<tbody>
						{#if $seatReservation.length > 0}
							{#each $seatReservation as reservation, index}
								<tr class="hover:bg-gray-100 dark:hover:bg-[#2a3038] transition-colors">
									<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] border-b border-r border-gray-200 dark:border-gray-800 table-cell">
										<span class="flex justify-center text-gray-700 dark:text-gray-300 font-semibold">
											{#if startingSerialNumber != null && startingSerialNumber > 0}
												{startingSerialNumber - index}
											{/if}
										</span>
									</td>
									
									<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{reservation.object_id}
										</div>
									</td>

									<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
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

									<td class="max-w-screen-sm p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{#if reservation?.comments?.[0]}
												 {reservation.comments[0]}
											{/if}
										</div>
										<div>
											{#if reservation.comments && !reservation.comments.length}
												{#each reservation.comments as comment}
													 <div><li>{comment}</li></div>
												{/each}
											{/if}
										</div>
									</td>

									<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{#if reservation?.exhibitions?.[0]}
												{reservation.exhibitions[0]?.exhibition_type}
											{/if}
										</div>
									</td>

									<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 table-cell w-32">
										<div class="flex justify-center items-center gap-2">
											{#if reservation.object_id && checkIfEdited(reservation.object_id)}
												<div class="h-4 w-4 bg-red-600 rounded-full" />
											{/if}
											<button
												on:click={() => {
													goto(`/dashboard/reservation/detail/${reservation.object_id}`);
												}}
												class="text-gray-400 p-1 border border-gray-400 dark:border-gray-600 rounded flex gap-2 hover:bg-gray-200 dark:hover:bg-[#2c3440] transition-colors"
											>
												View
											</button>
										</div>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td 
									colspan="6" 
									class="p-3 text-center bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800"
								>
									No data found
								</td>
							</tr>
						{/if}
					</tbody>
				</table>

			</div>
		</div>
		<!-- Pagination -->
		<Pagination {currentPage} {totalPages} {goToPage} />
	</div>
</div>
{/if}