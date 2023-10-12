<script lang="ts">
	import { onMount } from 'svelte';
	import { news, getData, deleteData } from '../../../stores/newsStore';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';

	export let data;
	let currentPage = 1;
	const pageSize = 8;
	let newsData = [];
	let totalPages = 1;

	onMount(() => {});

	async function fetchData() {
		let result = await getData(data.supabase, currentPage, pageSize);

		newsData = result.data || [];

		//

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

	function createNews() {
		goto('/dashboard/create_news');
	}

	// delete data
	async function handleDelete(newsId: any) {
		try {
			await deleteData(newsId, data.supabase);
			// alert('News deleted successfully!');
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
			name: 'news_languages',
			type: 'title'
		},
		{
			header: 'short description',
			name: 'news_languages',
			subField: 'short_description',
			type: 'array'
		},
		{
			header: 'long description',
			name: 'news_languages',
			subField: 'long_description',
			type: 'array'
		}
	];
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createNews} />

	<!-- table data -->

	<TableComponent {calculateIndex} {handleDelete} pageName="news" data={$news} {columnTitle} />

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
