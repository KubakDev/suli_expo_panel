<script lang="ts">
	import { onMount } from 'svelte';
	import { carousel, getData, deleteData } from '../../../stores/carouselStore';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;
	let currentPage = 1;
	const pageSize = 8;
	let totalPages = 1;
	let loaded = false;

	async function fetchData() {
		loaded = false;
		let result = await getData(data.supabase, currentPage, pageSize);

		// Recalculate the total number of pages
		const totalItems = result.count || 0;
		totalPages = Math.ceil(totalItems / pageSize);
		//
		loaded = true;
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
{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="max-w-screen-2xl mx-auto py-10 bg-white dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
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
{/if}
