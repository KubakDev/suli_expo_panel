<script lang="ts">
	import { onMount } from 'svelte';
	import { contactData, getData, deleteData } from '../../../stores/contactStor';
	import { goto } from '$app/navigation';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import Pagination from '$lib/components/pagination/Pagination.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	export let data;
	let totalPages = 1;
	let loaded = false;

	async function fetchData() {
		loaded = false;
		await getData(data.supabase);
		loaded = true;
	}

	onMount(fetchData);

	async function goToPage(page: number) {
		await fetchData();
	}

	function createContact() {
		goto('/dashboard/create_contactInfo');
	}

	async function handleDelete(contactInfo_id: number) {
		try {
			await deleteData(contactInfo_id, data.supabase);
			await fetchData();
		} catch (error) {}
	}

	function calculateIndex(index: number) {
		return index + 1;
	}

	const columnTitle = [
		{
			header: 'Email',
			name: 'contact_info_languages',
			type: 'email'
		},
		{
			header: 'Location',
			name: 'contact_info_languages',
			type: 'location'
		},
		{
			header: 'Phone Relations',
			name: 'contact_info_languages',
			type: 'phoneNumber_relations'
		},
		{
			header: 'Phone Technical',
			name: 'contact_info_languages',
			type: 'phoneNumber_Technical'
		},
		{
			header: 'Phone Administration',
			name: 'contact_info_languages',
			type: 'phoneNumber_Administration'
		},
		{
			header: 'Phone Marketing',
			name: 'contact_info_languages',
			type: 'phoneNumber_marketing'
		}
	];
</script>

{#if !loaded}
<div class="loading flex justify-center items-center h-screen">
	<div class="flex justify-center items-center h-screen">
		<Spinner size="h-16 w-16" color="border-gray-500" />  
	</div>
</div>
{:else}
<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createContact} />

	<!-- table data -->
	<TableComponent 
		{calculateIndex} 
		{handleDelete} 
		pageName="contactInfo" 
		data={$contactData} 
		{columnTitle} 
	/>
 
</div>
{/if}
