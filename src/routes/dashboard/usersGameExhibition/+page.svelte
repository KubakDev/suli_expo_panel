<script lang="ts">
	import { onMount } from 'svelte';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
	import { goto } from '$app/navigation';
	//@ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import AiFillEdit from 'svelte-icons-pack/ai/AiFillEdit';
	import { exportToExcel } from '$lib/utils/exportToExcel';
	import { Button } from 'flowbite-svelte';

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

<div class="max-w-screen-2xl mx-auto py-10 mt-5">
	<div class="filter-container mb-6 flex flex-col sm:flex-row gap-4">
		<input
			type="text"
			placeholder="Filter by FullName"
			bind:value={filterName}
			class="flex-grow p-2 border rounded focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-900 text-gray-900"
		/>
		<input
			type="text"
			placeholder="Filter by PhoneNumber"
			bind:value={filterPhoneNumber}
			class="flex-grow p-2 border rounded focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-900 text-gray-900"
		/>
		<div class="flex flex-col sm:flex-row gap-4">
			<button
				class="text-center font-medium focus:ring-4 focus:outline-none inline-flex items-center justify-center px-5 py-2 bg-gray-200 border border-gray-300 dark:text-gray-900 dark:bg-[#e0e1dd] dark:hover:bg-gray-300 focus:ring-gray-300 dark:focus:ring-gray-900 rounded"
				on:click={handleFilter}>Search</button
			>
			<button
				class=" text-center font-medium focus:ring-4 focus:outline-none inline-flex items-center justify-center px-5 py-2 bg-gray-200 border border-gray-300 dark:text-gray-900 dark:bg-[#e0e1dd] dark:hover:bg-gray-300 focus:ring-gray-300 dark:focus:ring-gray-900 rounded"
				on:click={clearFilter}
			>
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
				Clear Filter
			</button>
			<button
				class="text-center font-medium focus:ring-4 focus:outline-none inline-flex items-center justify-center px-5 py-2 bg-gray-200 border border-gray-300 dark:text-gray-900 dark:bg-[#e0e1dd] dark:hover:bg-gray-300 focus:ring-gray-300 dark:focus:ring-gray-900 rounded"
				on:click={() => {
					goto(`/dashboard/usersGameExhibition/userProfile`);
				}}>View User Profile</button
			>
			<Button on:click={handleExport}>Export</Button>
		</div>
	</div>

	{#if notFound}
		<p class="text-red-500">No results found</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border">#</th>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Full Name</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Company Name / Field Work</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Job Grade</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Phone Number</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Email</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Country / City</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Referrer Name</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Hotel Booking</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Created At</th
						>
						<th class="p-3 font-semibold uppercase bg-gray-200 text-gray-600 text-sm border"
							>Action</th
						>
					</tr>
				</thead>
				<tbody>
					{#each users as user, index}
						<tr class="text-gray-600 dark:text-gray-300">
							<td class="p-3 border dark:border-gray-800"
								>{index + 1 + (currentPage - 1) * pageSize}</td
							>
							<td class="p-3 border dark:border-gray-800">{user.name}</td>
							<td class="p-3 border dark:border-gray-800">{user.companyName} / {user.fieldWork}</td>
							<td class="p-3 border dark:border-gray-800">{user.jobGrade}</td>
							<td class="p-3 border dark:border-gray-800">{user.phoneNumber}</td>
							<td class="p-3 border dark:border-gray-800">{user.email}</td>
							<td class="p-3 border dark:border-gray-800">{user.country} / {user.city}</td>
							<td class="p-3 border dark:border-gray-800">{user.referrer_name}</td>
							<td class="p-3 border dark:border-gray-800">{user.hotelBooking}</td>
							<td class="p-3 border dark:border-gray-800"
								>{new Date(user.created_at).toLocaleString()}</td
							>
							<td class="p-3 border dark:border-gray-800">
								<button
									on:click={() => {
										goto(`/dashboard/usersGameExhibition/${user.id}`);
									}}
									class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2"
								>
									Edit
									<span
										><Icon
											src={AiFillEdit}
											color="green"
											size="20"
											className="custom-icon"
											title="Custom icon params"
										/></span
									>
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
