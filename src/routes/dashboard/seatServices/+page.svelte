<script lang="ts">
	import { onMount } from 'svelte';
	import {
		seatServices,
		getSeatServices,
		deleteSeatService
	} from '../../../stores/seatServicesStore';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';

	export let data;
	let currentPage = 1;
	const pageSize = 8;
	let seatServicesData = [];
	let totalPages = 1;

	//

	async function fetchData() {
		let result = await getSeatServices(data.supabase, currentPage, pageSize);

		seatServicesData = result.data ?? [];

		seatServices.set(seatServicesData);

		// Recalculate the total number of pages
		const totalItems = result.count || 0;
		totalPages = Math.ceil(totalItems / pageSize);
		//
	}

	onMount(fetchData);

	async function goToPage(page: number) {
		currentPage = page;
		await fetchData();
	}

	function createSeatServices() {
		goto('/dashboard/create_SeatServices');
	}

	// delete data
	// async function handleDelete(seatServicesId: any) {
	// 	try {
	// 		await deleteSeatService(seatServicesId, data.supabase);
	// 		// alert('seatServices deleted successfully!');
	// 		if (currentPage > totalPages) {
	// 			currentPage = totalPages;
	// 		}
	// 		await fetchData();
	// 	} catch (error) {
	//
	// 	}
	// }

	function calculateIndex(index: number) {
		return index + 1 + (currentPage - 1) * pageSize;
	}

	const columnTitle = [
		{
			header: 'thumbnail',
			name: 'icon',
			type: 'image'
		},

		{
			header: 'title',
			name: 'seat_services_languages',
			type: 'title'
		},
		{
			header: 'short description',
			name: 'seat_services_languages',
			type: 'description'
		}
	];
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createSeatServices} />

	<!-- table data -->
	<TableComponent
		{calculateIndex}
		handleDelete=""
		pageName="seatServices"
		data={$seatServices}
		{columnTitle}
	/>

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
