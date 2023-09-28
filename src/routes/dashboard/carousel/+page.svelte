<script lang="ts">
	import { onMount } from 'svelte';
	import { carousel, getData, deleteData } from '../../../stores/carouselStore';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';

	export let data;
	let currentPage = 1;
	const pageSize = 8;
	let totalPages = 1;

	async function fetchData() {
		let result = await getData(data.supabase, currentPage, pageSize);

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

	function createCarousel() {
		goto('/dashboard/create_carousel');
	}

	// delete data
	async function handleDelete(carouselId: number) {
		try {
			await deleteData(carouselId, data.supabase);
			// alert('Carousel deleted successfully!');
			if (currentPage > totalPages) {
				currentPage = totalPages;
			}
			await fetchData();
		} catch (error) {}
	}

	function calculateIndex(index: number) {
		return index + 1 + (currentPage - 1) * pageSize;
	}

	const columnTitle = [
		{
			header: 'image',
			name: 'image',
			type: 'image'
		},

		{
			header: 'title',
			name: 'carousel_languages',
			type: 'title'
		},
		{
			header: 'subtitle',
			name: 'carousel_languages',
			type: 'subtitle'
		}
	];
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createCarousel} />

	<!-- table data -->
	<TableComponent
		{calculateIndex}
		{handleDelete}
		pageName="carousel"
		data={$carousel}
		{columnTitle}
	/>

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
