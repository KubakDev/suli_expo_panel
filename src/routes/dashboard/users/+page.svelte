<script lang="ts">
	import { onMount } from 'svelte';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
	import { goto } from '$app/navigation';
	//@ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import AiFillEdit from 'svelte-icons-pack/ai/AiFillEdit';
	import { exportToExcel } from '$lib/utils/exportToExcel';
	import { Button } from 'flowbite-svelte';
	import { IconX, IconLayoutGrid, IconEdit, IconFilterCancel } from '@tabler/icons-svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

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
		hotelBooking: string;
	}

	export let data;
	let loaded = false;
	let isLoading = false;
	let currentPage = 1;
	const pageSize = 10;
	let totalPages = 1;
	let users: User[] = [];
	let filterName = '';
	let filterPhoneNumber = '';
	let notFound = false;
	let totalCount = 0;

	async function getUserRegistrations() {
		isLoading = true;
		const { data: result, error } = await data.supabase.rpc('get_paged_users_filter', {
			filter_name: filterName || null,
			filter_phonenumber: filterPhoneNumber || null,
			page_num: currentPage,
			page_size: pageSize
		});

		if (error) {
			console.error(error);
			isLoading = false;
			return;
		}

		const { page, page_limit, remainingItems, total_count, items } = result;

		users = items;
		totalCount = total_count;
		totalPages = Math.ceil(total_count / page_limit);
		notFound = users.length === 0;
		isLoading = false;
		loaded = true;
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
		const { data: result, error } = await data.supabase.rpc('get_all_users_data');
		exportToExcel(result);
	}
	
</script>
 
{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
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

				<!-- Updated clear filter button -->
				<button
					class="w-11 h-11 flex items-center justify-center 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
					on:click={clearFilter}
					title="Clear Filter"
				>
				<IconFilterCancel size={24} class="text-red-500" />
				</button>

				<button
					class="py-2 px-4 font-medium text-center text-base 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
					on:click={() => goto(`/dashboard/users/userProfile`)}>
					View User Profile
				</button>

				<!-- Updated export button -->
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

	<div class="overflow-x-auto rounded-lg shadow-lg">
		<div class="min-w-full table-responsive">
			{#if notFound || users.length === 0}
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell w-10"
							>
								<div class="flex justify-center items-center gap-2">
									<span>#</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Full Name</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Company / Field</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Job Grade</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Phone Number</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Email</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Country / City</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Hotel Booking</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Created At</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<IconLayoutGrid size={20} class="text-gray-500 dark:text-gray-400" />
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr class="text-gray-600 dark:text-gray-300">
							<td colspan="11" class="text-center p-4 text-gray-500 dark:text-gray-400">
								<div class="flex flex-col items-center justify-center gap-2">
									<p>No data found</p>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			{:else}
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell w-10"
							>
								<div class="flex justify-center items-center gap-2">
									<span>#</span>
								</div>
							</th>
							
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Full Name</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Company / Field</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Job Grade</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Phone Number</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Email</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Country / City</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Hotel Booking</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Created At</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<IconLayoutGrid size={20} class="text-gray-500 dark:text-gray-400" />
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each users as user, index}
							<tr class="hover:bg-gray-100 dark:hover:bg-[#2a3038] transition-colors">
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									<span class="flex justify-center text-gray-700 dark:text-gray-300 font-semibold"
										>{index + 1 + (currentPage - 1) * pageSize}</span
									>
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{user.name}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{user.companyName} / {user.fieldWork}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{user.jobGrade}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{user.phoneNumber}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{user.email}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{user.country} / {user.city}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{user.hotelBooking}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell">
									{new Date(user.created_at).toLocaleString()}
								</td>
								<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 table-cell">
									<div class="flex justify-center items-center">
										<button
											on:click={() => goto(`/dashboard/users/${user.id}`)}
											class="text-gray-400 p-1 border border-gray-500 dark:border-gray-600 rounded flex gap-2 hover:bg-gray-200 dark:hover:bg-[#2c3440] transition-colors"
										>
											Edit
											<IconEdit size={20} class="text-green-500" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
{/if}

<style>
	.filter-container input {
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
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
