<script lang="ts">
	import { onMount } from 'svelte';
	import { gallery, getData, deleteData } from '../../../stores/galleryStore';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;
	let currentPage = 1;
	const pageSize = 8;
	let searchQuery = '';
	let galleryData = [];
	let totalPages = 1;
	let isLoading = false;
	//

	async function fetchData() {
		isLoading = true;
		let result = await getData(data.supabase, currentPage, pageSize, searchQuery);

		galleryData = result.data;

		//

		// Recalculate the total number of pages
		const totalItems = result.count;
		totalPages = Math.ceil(totalItems / pageSize);
		isLoading = false;
		//
	}

	onMount(fetchData);

	async function goToPage(page: number) {
		currentPage = page;
		await fetchData();
	}

	function createGallery() {
		goto('/dashboard/create_gallery');
	}

	// delete data
	async function handleDelete(galleryId: number) {
		try {
			await deleteData(galleryId, data.supabase);
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
			header: 'thumbnail',
			name: 'thumbnail',
			type: 'image'
		},

		{
			header: 'title',
			name: 'gallery_languages',
			type: 'title'
		},
		{
			header: 'short description',
			name: 'gallery_languages',
			subField: 'short_description',
			type: 'array'
		},
		{
			header: 'long description',
			name: 'gallery_languages',
			subField: 'long_description',
			type: 'array'
		}
	];
</script>

{#if isLoading}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="max-w-screen-2xl mx-auto py-10 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] min-h-screen p-4">
	<!-- insert new data -->
	<InsertButton insertData={createGallery} />

	<!-- table data -->
	<TableComponent
		{calculateIndex}
		{handleDelete}
		pageName="gallery"
		data={$gallery}
		{columnTitle}
	/>

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
{/if}
