<script lang="ts">
	import { onMount } from 'svelte';
	import { about, getData } from '../../../stores/aboutStore';
	import { staff, getDataStaff, deleteData } from '../../../stores/staffStore';
	import { goto } from '$app/navigation';
	import InsertButton from '$lib/components/InsertButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';

	export let data;
	let aboutData: any = [];
	let staffData: any = [];

	async function fetchData() {
		let result = await getData(data.supabase);
		let staffResult = await getDataStaff(data.supabase);
		aboutData = result;
		staffData = staffResult;
	}

	onMount(fetchData);
	function extractText(html: any) {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;
		return tempElement.textContent || tempElement.innerText || '';
	}

	function createAbout() {
		goto('/dashboard/create_about');
	}

	function createStaff() {
		goto('/dashboard/create_staff');
	}

	// delete data
	async function handleDelete(staffId: number) {
		try {
			await deleteData(staffId, data.supabase);
			// alert('member deleted successfully!');

			await fetchData();
		} catch (error) {
			console.error('Error deleting member:', error);
		}
	}

	const columnTitle = [
		{
			header: 'image',
			name: 'image',
			type: 'image'
		},

		{
			header: 'short description',
			name: 'about_languages',
			subField: 'short_description',
			type: 'array'
		}
	];

	const columnTitle_staff = [
		{
			header: 'image',
			name: 'image',
			type: 'image'
		},
		{
			header: 'job title',
			name: 'staff_languages',
			type: 'title'
		},
		{
			header: 'name',
			name: 'staff_languages',
			type: 'name'
		}
	];

	function calculateIndex(index: number) {
		return index + 1;
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10 px-4 lg:px-0">
	<!-- About Section  -->
	<div>
		<!-- insert new data -->
		<InsertButton insertData={createAbout} />

		<!-- table data -->
		<TableComponent {calculateIndex} handleDelete="" pageName="about" data={$about} {columnTitle} />
	</div>

	<!-- Staff Section  -->
	<div class="py-10">
		<!-- insert new data -->
		<InsertButton insertData={createStaff} />

		<!-- table data -->
		<TableComponent
			{calculateIndex}
			{handleDelete}
			pageName="staff"
			data={$staff}
			columnTitle={columnTitle_staff}
		/>
	</div>
</div>
