<script lang="ts">
	import { onMount } from 'svelte';
	import type { ExhibitionModel } from '../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../stores/exhibitionTypeStore';
	import { ButtonGroup, InputAddon, Label } from 'flowbite-svelte';
	import type { PageData } from '../../routes/$types';

	export let handleSelectChange: (event: Event) => void;
	export let data: PageData;

	let exhibitionData: ExhibitionModel[] = [];
	const fetchData = async () => {
		try {
			exhibitionData = await getDataExhibition(data.supabase);

			let uniqueTypes = exhibitionData.filter((item, index, array) => {
				return !array
					.slice(0, index)
					.some((prevItem) => prevItem.exhibition_type === item.exhibition_type);
			});
			exhibitionData = uniqueTypes;
		} catch (error) {}
	};

	onMount(fetchData);
</script>

<div class="mb-6">
	<ButtonGroup class="w-full">
		<select
			class="border border-gray-300 rounded-l-md w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
			id="type"
			name="type"
			on:change={handleSelectChange}
		>
			<option>Select Type</option>
			{#each exhibitionData as exhibition}
				<option value={exhibition.id}>{exhibition.exhibition_type}</option>
			{/each}
		</select>
		<InputAddon class="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="dark:fill-white">
				<path d="M0 0h24v24H0z" fill="none" />
				<path
					d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 2v3H6V4h12zM5 20V9h14v11H5zm3-7h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
				/>
			</svg>
		</InputAddon>
	</ButtonGroup>
</div>
