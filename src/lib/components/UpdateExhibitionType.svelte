<script lang="ts">
	import { ButtonGroup, InputAddon, Label } from 'flowbite-svelte';
	import type { ExhibitionModel } from '../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../stores/exhibitionTypeStore';
	import { onMount } from 'svelte';

	export let handleSelectChange: any;
	export let pageData: any;
	export let data: any;

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

<Label class="space-y-2 mb-2">
	<label for="exhibition_type" class="block font-normal">Exhibition Type</label>
	<ButtonGroup class="w-full">
		<select
			class="dark:text-gray-900 border border-gray-300 rounded-l-md w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
			id="type"
			name="type"
			on:change={handleSelectChange}
		>
			<option value="Select Type" selected={pageData.exhibition_id === undefined}>
				Select Type
			</option>
			{#each exhibitionData as exhibition}
				<option value={exhibition.id} selected={pageData.exhibition_id === exhibition.id}>
					{exhibition.exhibition_type}
				</option>
			{/each}
		</select>
		<InputAddon class="bg-white ">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
				<path d="M0 0h24v24H0z" fill="none" />
				<path
					d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 2v3H6V4h12zM5 20V9h14v11H5zm3-7h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
				/>
			</svg>
		</InputAddon>
	</ButtonGroup>
</Label>
