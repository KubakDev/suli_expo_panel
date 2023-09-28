<script lang="ts">
	import { onMount } from 'svelte';
	import { vedioStore, getData, deleteData } from '../../../stores/media_VideoStore';
	import { goto } from '$app/navigation';
	import Pagination from '../../../lib/components/pagination/Pagination.svelte';
	//@ts-ignore
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

	async function goToPage(page: number) {
		currentPage = page;
		await fetchData();
	}

	function createMediaVideo() {
		goto('/dashboard/create_MediaVideo');
	}

	// delete data
	async function handleDelete(mediaVideoId: number) {
		try {
			await deleteData(mediaVideoId, data.supabase);

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
			name: 'media_video_languages',
			type: 'title'
		},
		{
			header: 'short description',
			name: 'media_video_languages',
			subField: 'short_description',
			type: 'array'
		},
		{
			header: 'long description',
			name: 'media_video_languages',
			subField: 'long_description',
			type: 'array'
		}
	];
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createMediaVideo} />

	<!-- table data -->
	<TableComponent
		{calculateIndex}
		{handleDelete}
		pageName="mediaVideo"
		data={$vedioStore}
		{columnTitle}
	/>

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
