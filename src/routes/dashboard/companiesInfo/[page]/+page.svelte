<script lang="ts">
	import { onMount } from 'svelte';
	import { getCompanyData, companyInfo } from '../../../../stores/companyInfo';
	import { Button, Dropdown } from 'flowbite-svelte';
	import { IconTableOptions, IconFilter, IconFilterOff, IconX, IconChevronDown, IconFilterCancel, IconLayoutGrid } from '@tabler/icons-svelte';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import { page } from '$app/stores';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';
	import { Icon } from 'flowbite-svelte-icons';
	export let data;
	let searchQuery: string = '';
	let searchField: string | null = null;
	let isOptionSelected: boolean = false;
	let currentPage: number = 1;
	const pageSize: number = 12;
	let totalPages: number = 1;
	let totalItems: number;
	let loaded = false;
	
	onMount(() => {
		currentPage = +$page.params.page;
		fetchCompanyData();
	});

	async function goToPage(page: number) {
		currentPage = page;
		await fetchCompanyData();
		goto(`/dashboard/companiesInfo/${currentPage}`);  
	}

	async function fetchCompanyData() {
		loaded = false;   
		const result = await getCompanyData(
			data.supabase,
			searchField,
			searchQuery,
			currentPage,
			pageSize
		);

		totalItems = result.count || 0;
		totalPages = Math.ceil(totalItems / pageSize);
		loaded = true;   
	}

	//create checkboxes
	const options = ['company name', 'company phoneNumber', 'company email'];
	let checked: any = {};

	function selectOneCheckbox(index: number) {
		const option = options[index];

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
		}

		isOptionSelected = true;
		fetchCompanyData();
	}

	async function filterByCompany() {
		if (isOptionSelected && searchQuery && searchField !== null) {
			const result = await getCompanyData(
				data.supabase,
				searchField,
				searchQuery,
				currentPage,
				pageSize
			);
			totalItems = result.count || 0;
			totalPages = Math.ceil(totalItems / pageSize);
			// seatReservation.set(filteredData);
		} else {
			const result = await getCompanyData(
				data.supabase,
				undefined,
				undefined,
				currentPage,
				pageSize
			);

			totalItems = result.count || 0;
			totalPages = Math.ceil(totalItems / pageSize);
		}
		await fetchCompanyData();
		currentPage = 1;
	}

	// clear filter
	function clearFilters() {
		isOptionSelected = false;
		searchQuery = '';
		searchField = null;
		for (const opt of options) {
			checked[opt] = false;
		}

		fetchCompanyData();
	}

	// clear all filters
	function clearAllFilters() {
		searchQuery = '';
		searchField = null;
		isOptionSelected = false;
		for (const opt of options) {
			checked[opt] = false;
		}
		currentPage = 1;
		sessionStorage.setItem('currentPage', '1'); // Update the session storage
		goto('/dashboard/companiesInfo/1'); // Update the URL

		fetchCompanyData();
	}

	// create Series  number
	let startingSerialNumber: number = 0;
	$: if (totalItems != null && currentPage != null && pageSize != null) {
		startingSerialNumber = totalItems - (currentPage - 1) * pageSize;
	}
</script>

{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="max-w-screen-2xl mx-auto py-10">
	<div class="py-5 px-4 lg:px-0 flex justify-between gap-5">
		<!-- total count -->
		<div
			class=" shadow-none flex justify-start items-start px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 text-sm"
		>
			Showing <span class="font-bold mx-2 dark:text-gray-200"> {totalItems}</span> Company
		</div>
		<!-- clear All filters  -->
		<div class="flex gap-2">
			
			<!-- filtering by company -->
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
							<label for="option{index}" class="text-gray-900 dark:text-gray-100">
								{option}
							</label>
						</div>
					{/each}
				</Dropdown>
			</div>

			<div class="flex items-center gap-2">
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
			</div>


		</div>
	</div>

	<!-- table data -->
	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded shadow-lg">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border border-gray-200 dark:border-gray-700">
					<thead>
						<tr class="border border-gray-200 dark:border-gray-700">
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell w-10"
							>
								<div class="flex justify-center items-center gap-2">
									<span>#</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>company name</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>company email </span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>company phone_number</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
							>
								<IconTableOptions class="w-5 h-5 text-gray-500 dark:text-gray-400 mx-auto" />
							</th>
						</tr>
					</thead>

					<tbody class="dark:text-gray-300">
						{#if $companyInfo.length > 0}
							{#each $companyInfo as item, index (item.id)}
								<tr class="border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a3038]">
									<td
										class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div class="flex justify-center">
											{#if startingSerialNumber != null && startingSerialNumber > 0}
												<div>{startingSerialNumber - index}</div>
											{/if}
										</div>
									</td>

									<td
										class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div>
											{item?.company_name}
										</div>
									</td>

									<td
										class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div>
											{item?.email}
										</div>
									</td>
									<td
										class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
									>
										<div>
											{item?.phone_number}
										</div>
									</td>

									<td
										class="p-3 bg-gray-10 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell text-center"
									>
										<button
											on:click={() => {
												goto(`/dashboard/companiesInfo/detail/${item.id}`);
											}}
											class="text-gray-600 dark:text-gray-400 hover:underline"
										>
											View
										</button>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="5" class="p-3 text-center border border-gray-200 dark:border-gray-700">
									No data found
								</td>
							</tr>
						{/if}
					</tbody>
				</table>

			</div>
		</div>
		<!-- Add pagination -->
		<Pagination {currentPage} {totalPages} {goToPage} />
	</div>
</div>
{/if}