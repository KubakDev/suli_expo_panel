<script lang="ts">
	import { onMount } from 'svelte';
	import { promotion, getData, deleteData } from '../../../stores/promoStore';
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
		//
	}

	onMount(fetchData);

	async function goToPage(page: number) {
		currentPage = page;
		await fetchData();
	}

	function createPromotion() {
		goto('/dashboard/create_promotion');
	}

	// delete data
	async function handleDelete(promoId: number) {
		try {
			await deleteData(promoId, data.supabase);

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
			name: 'promo_languages',
			type: 'title'
		},
		{
			header: 'link',
			name: 'promo_languages',
			type: 'link'
		}
	];
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createPromotion} />

	<!-- table data -->
	<TableComponent
		{calculateIndex}
		{handleDelete}
		pageName="promotions"
		data={$promotion}
		{columnTitle}
	/>

	<!-- Add pagination -->
	<Pagination {currentPage} {totalPages} {goToPage} />
</div>
