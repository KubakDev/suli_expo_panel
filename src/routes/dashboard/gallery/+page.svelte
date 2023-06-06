<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { getData, deleteData } from '../../../stores/galleryStore';
	import type { GalleryModel } from '../../../models/galleryModel';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let galleryData: GalleryModel[] = [];

	// get data
	const fetchData = async () => {
		try {
			galleryData = await getData(data.supabase);
			// console.log('galleryData:', galleryData);
		} catch (error) {
			console.error(error);
		}
	};

	onMount(fetchData);

	// delete data
	const handleDelete = async (galleryId) => {
		try {
			await deleteData(galleryId, data.supabase);
			console.log('Gallery deleted successfully!');
			await fetchData(); // Fetch updated data after delete
		} catch (error) {
			console.error('Error deleting gallery:', error);
		}
	};

	function createGallery() {
		goto('/dashboard/create_gallery');
	}

	export let data;
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<div class="py-5 flex justify-end">
		<Button on:click={createGallery} class="bg-primary-dark hover:bg-primary-50">Create</Button>
	</div>

	<div class="overflow-x-auto">
		<table class="border-collapse w-full">
			<thead>
				<tr>
					<th
						class="p-3 font-bold uppercase bg-[#14213d] text-gray-400 border border-gray-300 table-cell"
						>Thumbnail</th
					>
					<th
						class="p-3 font-bold uppercase bg-[#14213d] text-gray-400 border border-gray-300 table-cell"
						>Title</th
					>
					<th
						class="p-3 font-bold uppercase bg-[#14213d] text-gray-400 border border-gray-300 table-cell"
						>Short description</th
					>
					<th
						class="p-3 font-bold uppercase bg-[#14213d] text-gray-400 border border-gray-300 table-cell"
						>Long description</th
					>
					<th
						class="p-3 font-bold uppercase bg-[#14213d] text-gray-400 border border-gray-300 table-cell"
						>Actions</th
					>
				</tr>
			</thead>

			<tbody>
				{#each galleryData as item (item.id)}
					<tr>
						<td class="p-3 bg-gray-10 border border-gray-300 table-cell">
							<div class="flex justify-center">
								<img
									class="w-20 h-20 rounded-md object-cover"
									src={item.thumbnail
										? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${item.thumbnail}`
										: 'https://images.hindustantimes.com/img/2022/08/07/1600x900/cat_1659882617172_1659882628989_1659882628989.jpg'}
									alt=""
								/>
							</div>
						</td>
						<td class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-300 table-cell">
							{#each item.gallery_languages as lang}
								<div>
									{lang.title}
								</div>
							{/each}
						</td>
						<td class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-300 table-cell">
							{#each item.gallery_languages as lang}
								<div>
									{lang.short_description?.slice(0, 40)}
								</div>
							{/each}
						</td>
						<td class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-300 table-cell">
							{#each item.gallery_languages as lang}
								<div>
									{lang.long_description?.slice(0, 40)}
								</div>
							{/each}
						</td>

						<td class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-300 table-cell">
							<div class="flex items-center">
								<button
									on:click={() => {
										goto(`/dashboard/gallery/${item.id}`);
									}}
									class="text-green-400 hover:text-green-600 underline">Edit</button
								>

								<button
									on:click={() => handleDelete(item.id)}
									class="text-red-400 hover:text-red-600 underline pl-6">Remove</button
								>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
