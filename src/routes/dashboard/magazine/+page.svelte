<script lang="ts">
	import { onMount } from 'svelte';
	import { magazine, getData, deleteData } from '../../../stores/magazineStore';
	import { goto } from '$app/navigation';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
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
	}

	onMount(fetchData);

	async function goToPage(page: any) {
		currentPage = page;
		await fetchData();
	}

	function createMagazine() {
		goto('/dashboard/create_magazine');
	}

	// delete data
	async function handleDelete(magazineId: any) {
		try {
			await deleteData(magazineId, data.supabase);
			// alert('Magazine deleted successfully!');
			if (currentPage > totalPages) {
				currentPage = totalPages;
			}
			await fetchData();
		} catch (error) {}
	}

	function calculateIndex(index: any) {
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
			name: 'magazine_languages',
			type: 'title'
		},
		{
			header: 'short description',
			name: 'magazine_languages',
			subField: 'short_description',
			type: 'array'
		},
		{
			header: 'long description',
			name: 'magazine_languages',
			subField: 'long_description',
			type: 'array'
		}
	];
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createMagazine} />

	<!-- table data -->
	<TableComponent
		{calculateIndex}
		{handleDelete}
		pageName="magazine"
		data={$magazine}
		{columnTitle}
	/>

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
