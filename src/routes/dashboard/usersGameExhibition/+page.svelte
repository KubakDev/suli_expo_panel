<script lang="ts">
	import { onMount } from 'svelte';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
	import { goto } from '$app/navigation';
	//@ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import AiFillEdit from 'svelte-icons-pack/ai/AiFillEdit';
	import { exportToExcel } from '$lib/utils/exportToExcel';
	import { Button } from 'flowbite-svelte';
	import { IconX, IconEdit, IconLayoutGrid } from '@tabler/icons-svelte';

	interface User {
		id: number;
		created_at: string;
		name: string;
		companyName: string;
		fieldWork: string;
		jobGrade: string;
		phoneNumber: string;
		email: string;
		country: string;
		city: string;
		referrer_name: string;
		hotelBooking: string;
	}

	export let data;
	let currentPage = 1;
	const pageSize = 10;
	let totalPages = 1;
	let users: User[] = [];
	let filterName = '';
	let filterPhoneNumber = '';
	let notFound = false;
	let totalCount = 0;

	async function getUserRegistrations() {
		const { data: result, error } = await data.supabase.rpc(
			'get_paged_users_game_exhibition_filter',
			{
				filter_name: filterName || null,
				filter_phonenumber: filterPhoneNumber || null,
				page_num: currentPage,
				page_size: pageSize
			}
		);

		if (error) {
			console.error(error);
			return;
		}

		const { page, page_limit, remainingItems, total_count, items } = result;

		users = items;
		totalCount = total_count;
		totalPages = Math.ceil(total_count / page_limit);
		notFound = users.length === 0;
	}

	onMount(getUserRegistrations);

	async function handleFilter() {
		currentPage = 1; // Reset to the first page on new filter
		await getUserRegistrations();
	}

	async function clearFilter() {
		filterName = '';
		filterPhoneNumber = '';
		currentPage = 1;
		await getUserRegistrations();
	}

	async function goToPage(page: number) {
		currentPage = page;
		await getUserRegistrations();
	}

	// Handle export all data
	async function handleExport() {
		const { data: result, error } = await data.supabase.rpc(
			'get_all_users_data_to_game_exhibition'
		);
		exportToExcel(result);
	}
</script>
 
<div class="max-w-screen-2xl mx-auto py-10">
	<!-- Filter Container -->
	<div class="py-5 px-4 lg:px-0 flex items-center justify-between gap-5">
		<!-- Total count -->
		<div class="shadow-none flex justify-start items-start px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 text-sm">
			Showing <span class="font-bold mx-2 dark:text-gray-200">{totalCount}</span> User
		</div>

		<!-- Filters and Actions -->
		<div class="flex flex-col lg:flex-row justify-end items-center gap-2">
			<input
				type="text"
				placeholder="Filter by FullName"
				bind:value={filterName}
				class="w-56 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 
				text-gray-900 dark:text-gray-100 text-sm rounded-lg 
				focus:ring-gray-200 focus:border-gray-300 
				dark:focus:ring-gray-600 dark:focus:border-gray-600 
				block pl-3 p-2.5"
			/>
			<input
				type="text"
				placeholder="Filter by PhoneNumber"
				bind:value={filterPhoneNumber}
				class="w-56 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 
				text-gray-900 dark:text-gray-100 text-sm rounded-lg 
				focus:ring-gray-200 focus:border-gray-300 
				dark:focus:ring-gray-600 dark:focus:border-gray-600 
				block pl-3 p-2.5"
			/>

			<!-- Action buttons group -->
			<div class="flex items-center gap-2">
				<button
					class="py-2 px-4 font-medium text-center text-base 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
					on:click={handleFilter}>Search</button>

				<button
					class="w-11 h-11 flex items-center justify-center 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
					on:click={clearFilter}
					title="Clear Filter"
				>
					<IconX size={24} class="text-red-500" />
				</button>

				<button
					class="py-2 px-4 font-medium text-center text-base 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
					on:click={() => goto(`/dashboard/usersGameExhibition/userProfile`)}>
					View User Profile
				</button>

				<Button 
					class="py-2 px-4 font-medium text-center text-base 
					bg-primary-600 hover:bg-primary-700 text-white 
					dark:bg-primary-600 dark:hover:bg-primary-700 dark:text-white 
					border border-primary-600 dark:border-primary-600 
					rounded focus:ring-0 focus:ring-primary-300 focus:ring-offset-0"
					on:click={handleExport}>
					Export
				</Button>
			</div>
		</div>
	</div>

	{#if notFound || users.length === 0}
		<div class="overflow-x-auto">
			<table class="min-w-full border border-gray-200 dark:border-gray-700">
				<thead>
					<tr class="border border-gray-200 dark:border-gray-700">
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell w-10">
							<div class="flex justify-center items-center gap-2">
								<span>#</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Name</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Company</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Field Work</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Job Grade</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Phone</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Email</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Country</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">City</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Referrer</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Hotel Booking</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td colspan="12" class="text-center p-4 text-gray-500 dark:text-gray-400">
							<div class="flex flex-col items-center justify-center gap-2">
								<p>No data found</p>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full border border-gray-200 dark:border-gray-700">
				<thead>
					<tr class="border border-gray-200 dark:border-gray-700">
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell w-10">
							<div class="flex justify-center items-center gap-2">
								<span>#</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Name</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Company</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Field Work</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Job Grade</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Phone</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Email</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Country</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">City</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Referrer</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Hotel Booking</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-transparent text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user, index}
						<tr class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
							<!-- Table cells with updated styling -->
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{index + 1 + (currentPage - 1) * pageSize}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.name}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.companyName}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.fieldWork}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.jobGrade}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.phoneNumber}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.email}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.country}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.city}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.referrer_name}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								{user.hotelBooking}
							</td>
							<td class="p-3 border border-gray-300 dark:border-gray-600">
								<button
									on:click={() => goto(`/dashboard/usersGameExhibition/${user.id}`)}
									class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2"
								>
									Edit
									<span>
										<Icon
											src={AiFillEdit}
											color="green"
											size="20"
											className="custom-icon"
											title="Custom icon params"
										/>
									</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<Pagination {currentPage} {totalPages} {goToPage} />
</div>

<style>
	.filter-container input {
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 8px;
		text-align: left;
	}

	@media (max-width: 768px) {
		.filter-container {
			flex-direction: column;
			gap: 10px;
		}

		table thead {
			display: none;
		}

		table,
		tbody,
		tr,
		td {
			display: block;
			width: 100%;
		}

		tr {
			margin-bottom: 15px;
		}

		td {
			text-align: right;
			padding-left: 50%;
			position: relative;
		}

		td::before {
			content: attr(data-label);
			position: absolute;
			left: 0;
			width: 50%;
			padding-left: 15px;
			font-weight: bold;
			text-align: left;
		}
	}
</style>
