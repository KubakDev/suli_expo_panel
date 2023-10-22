<script lang="ts">
	import { onMount } from 'svelte';
	import { getCompanyData, companyInfo } from '../../../../stores/companyInfo';
	import { Button, Dropdown } from 'flowbite-svelte';
	import { Icon } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import { page } from '$app/stores';

	export let data;
	let searchQuery: string = '';
	let searchField: string | null = null;
	let isOptionSelected: boolean = false;
	let currentPage: number = 1;
	const pageSize: number = 12;
	let totalPages: number = 1;
	let totalItems: any;

	onMount(() => {
		currentPage = +$page.params.page;
		fetchCompanyData();
	});

	async function goToPage(page: number) {
		currentPage = page;
		await fetchCompanyData();
		goto(`/dashboard/companiesInfo/${currentPage}`); // Update the URL
	}

	async function fetchCompanyData() {
		const result = await getCompanyData(
			data.supabase,
			searchField,
			searchQuery,
			currentPage,
			pageSize
		);

		totalItems = result.count || 0;
		totalPages = Math.ceil(totalItems / pageSize);
	}

	onMount(fetchCompanyData);

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
			<div class="">
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

			<!-- filtering by company -->
			<div class="w-44">
				<Button
					class="py-2 font-medium text-center text-base  hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
				>
					Filter <Icon
						name="chevron-down-solid"
						class="w-3 h-3 ml-2 text-gray-500 dark:text-gray-500   "
					/>
				</Button>
				<Dropdown class="bg-[#e9ecefd2] dark:bg-gray-100 space-y-3 rounded">
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

						{#if $companyInfo.length > 0}
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
									<span>company email </span>
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
								class="flex justify-center items-center p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm"
							>
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
							</th>
						</tr>
					</thead>

					<tbody class="dark:text-gray-300">
						{#if $companyInfo.length > 0}
							{#each $companyInfo as item, index (item.id)}
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

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{item?.company_name}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{item?.email}
										</div>
									</td>
									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{item?.phone_number}
										</div>
									</td>

									<td
										class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 flex justify-center items-center gap-4"
									>
										<button
											on:click={() => {
												goto(`/dashboard/companiesInfo/detail/${item.id}`);
											}}
											class="dark:text-gray-400 hover:underline"
											>View
										</button>
									</td>
								</tr>
							{/each}
						{:else}
							<p>No data found</p>
						{/if}
					</tbody>
				</table>

				<!-- Add pagination -->
				<Pagination {currentPage} {totalPages} {goToPage} />
			</div>
		</div>
	</div>
</div>
