<script lang="ts">
	import { onMount } from 'svelte';
	import { publishing, getData, deleteData } from '../../../stores/publishingStore';
	import { goto } from '$app/navigation';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
	//@ts-ignore
	import InsertButton from '$lib/components/InsertButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	
	export let data;
	let currentPage = 1;
	const pageSize = 8;
	let isLoading = false;
	let totalPages = 1;

	async function fetchData() {
		isLoading = true;
		let result = await getData(data.supabase, currentPage, pageSize);

		// Recalculate the total number of pages
		const totalItems = result.count || 0;
		totalPages = Math.ceil(totalItems / pageSize);
		isLoading = false;
	}

	onMount(fetchData);

	async function goToPage(page: number) {
		currentPage = page;
		await fetchData();
	}

	function createPublishing() {
		goto('/dashboard/create_Publishing');
	}

	// delete data
	async function handleDelete(publishingId: number) {
		try {
			await deleteData(publishingId, data.supabase);

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
			name: 'publishing_languages',
			type: 'title'
		},
		{
			header: 'short description',
			name: 'publishing_languages',
			subField: 'short_description',
			type: 'array'
		},
		{
			header: 'long description',
			name: 'publishing_languages',
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
<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createPublishing} />

	<!-- table data -->
	<TableComponent
		{calculateIndex}
		{handleDelete}
		pageName="publishing"
		data={$publishing}
		{columnTitle}
	/>

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
{/if}
