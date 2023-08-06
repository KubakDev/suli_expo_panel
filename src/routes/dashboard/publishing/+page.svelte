<script lang="ts">
	import { onMount } from 'svelte';
	import { publishing, getData, deleteData } from '../../../stores/publishingStore';
	import { goto } from '$app/navigation';
	import { Button } from 'flowbite-svelte';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	//@ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import AiFillEdit from 'svelte-icons-pack/ai/AiFillEdit';
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
		console.log(totalPages);
	}

	onMount(fetchData);

	async function goToPage(page: any) {
		currentPage = page;
		await fetchData();
	}

	function createPublishing() {
		goto('/dashboard/create_Publishing');
	}

	// delete data
	async function handleDelete(publishingId: any) {
		try {
			await deleteData(publishingId, data.supabase);

			if (currentPage > totalPages) {
				currentPage = totalPages;
			}
			await fetchData();
		} catch (error) {
			console.error('Error deleting publishing:', error);
		}
	}

	function calculateIndex(index: any) {
		return index + 1 + (currentPage - 1) * pageSize;
	}

	// convert html tag that return it from db to regular text
	function extractText(html: any) {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;
		return tempElement.textContent || tempElement.innerText || '';
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
