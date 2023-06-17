<script>
	import { onMount } from 'svelte';
	import { magazine, getData, deleteData } from '../../../stores/magazineStore';
	import { goto } from '$app/navigation';
	import { Button } from 'flowbite-svelte';

	export let data;
	let currentPage = 1;
	const pageSize = 5;

	let magazineData = [];
	let totalPages = 1;

	async function fetchData() {
		let result = await getData(data.supabase, currentPage, pageSize);
		magazineData = result.data;
		magazine.set(magazineData);

		// Recalculate the total number of pages
		const totalItems = result.count || 0;
		totalPages = Math.ceil(totalItems / pageSize);
		console.log(totalPages);
	}

	onMount(fetchData);

	async function goToPage(page) {
		currentPage = page;
		await fetchData();
	}

	function createMagazine() {
		goto('/dashboard/create_magazine');
	}

	// delete data
	async function handleDelete(magazineId) {
		try {
			await deleteData(magazineId, data.supabase);
			alert('Magazine deleted successfully!');
			if (currentPage > totalPages) {
				currentPage = totalPages;
			}
			await fetchData();
		} catch (error) {
			console.error('Error deleting magazine:', error);
		}
	}

	function calculateIndex(index) {
		return index + 1 + (currentPage - 1) * pageSize;
	}

	// convert html tag that return it from db to regular text
	function extractText(html) {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;
		return tempElement.textContent || tempElement.innerText || '';
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<div class="py-5 flex justify-end">
		<Button on:click={createMagazine} class="bg-primary-dark hover:bg-primary-50">Create</Button>
	</div>

	<div class="overflow-x-auto rounded-md">
		<table class="border-collapse w-full">
			<thead>
				<tr>
					<th
						class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
					>
						<div class="flex justify-start items-center gap-2">
							<span>
								<svg
									width="20px"
									height="20px"
									viewBox="0 -5.5 21 21"
									version="1.1"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									fill="#000000"
									><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									/><g id="SVGRepo_iconCarrier">
										<title>list [#1510]</title> <desc>Created with Sketch.</desc> <defs />
										<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
											<g
												id="Dribbble-Light-Preview"
												transform="translate(-59.000000, -285.000000)"
												fill="#65686c"
											>
												<g id="icons" transform="translate(56.000000, 160.000000)">
													<path
														d="M3,135 L5.1,135 L5.1,133 L3,133 L3,135 Z M3,127.006 L5.1,127.006 L5.1,125.006 L3,125.006 L3,127.006 Z M3,131 L5.1,131 L5.1,129 L3,129 L3,131 Z M7.2,135 L24,135 L24,133 L7.2,133 L7.2,135 Z M7.2,127 L24,127 L24,125 L7.2,125 L7.2,127 Z M7.2,131 L24,131 L24,129 L7.2,129 L7.2,131 Z"
														id="list-[#1510]"
													/>
												</g>
											</g>
										</g>
									</g></svg
								></span
							><span>no</span>
						</div>
					</th>

					<th
						class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
					>
						<div class="flex items-center gap-2">
							<span
								><svg
									width="20px"
									height="20px"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									/><g id="SVGRepo_iconCarrier">
										<path
											d="M21.6809 16.9601L18.5509 9.65013C17.4909 7.17013 15.5409 7.07013 14.2309 9.43013L12.3409 12.8401C11.3809 14.5701 9.5909 14.7201 8.3509 13.1701L8.1309 12.8901C6.8409 11.2701 5.0209 11.4701 4.0909 13.3201L2.3709 16.7701C1.1609 19.1701 2.9109 22.0001 5.5909 22.0001H18.3509C20.9509 22.0001 22.7009 19.3501 21.6809 16.9601Z"
											stroke="#65686c"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											opacity="0.4"
											d="M6.9707 8C8.62756 8 9.9707 6.65685 9.9707 5C9.9707 3.34315 8.62756 2 6.9707 2C5.31385 2 3.9707 3.34315 3.9707 5C3.9707 6.65685 5.31385 8 6.9707 8Z"
											stroke="#65686c"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</g></svg
								></span
							>

							<span>Thumbnail</span>
						</div>
					</th>
					<th
						class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
					>
						<div class="flex items-start gap-2">
							<span
								><svg
									width="20px"
									height="20px"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									/><g id="SVGRepo_iconCarrier">
										<g id="Menu / Menu_Alt_01">
											<path
												id="Vector"
												d="M12 17H19M5 12H19M5 7H19"
												stroke="#65686c"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</g>
									</g></svg
								></span
							>

							<span>Title</span>
						</div>
					</th>
					<th
						class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
					>
						<div class="flex items-center gap-2">
							<span>
								<svg
									width="20px"
									height="20px"
									viewBox="0 0 16 16"
									xmlns="http://www.w3.org/2000/svg"
									version="1.1"
									fill="none"
									stroke="#65686c"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									/><g id="SVGRepo_iconCarrier">
										<path d="m2.75 12.25h10.5m-10.5-4h10.5m-10.5-4h10.5" />
									</g></svg
								></span
							>
							<span>Short description</span>
						</div>
					</th>
					<th
						class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
					>
						<div class="flex items-center gap-2">
							<span>
								<svg
									width="20px"
									height="20px"
									viewBox="0 0 16 16"
									xmlns="http://www.w3.org/2000/svg"
									version="1.1"
									fill="none"
									stroke="#65686c"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									/><g id="SVGRepo_iconCarrier">
										<path d="m2.75 12.25h10.5m-10.5-4h10.5m-10.5-4h10.5" />
									</g></svg
								></span
							>

							<span> Long description</span>
						</div>
					</th>
					<th
						class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
					>
						<div class="flex items-start gap-2">
							<span
								><svg
									width="20px"
									height="20px"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									fill="#65686c"
									><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									/><g id="SVGRepo_iconCarrier"
										><path
											d="M9.5 2h-6A1.502 1.502 0 0 0 2 3.5v6A1.502 1.502 0 0 0 3.5 11h6A1.502 1.502 0 0 0 11 9.5v-6A1.502 1.502 0 0 0 9.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 2h-6A1.502 1.502 0 0 0 13 3.5v6a1.502 1.502 0 0 0 1.5 1.5h6A1.502 1.502 0 0 0 22 9.5v-6A1.502 1.502 0 0 0 20.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM9.5 13h-6A1.502 1.502 0 0 0 2 14.5v6A1.502 1.502 0 0 0 3.5 22h6a1.502 1.502 0 0 0 1.5-1.5v-6A1.502 1.502 0 0 0 9.5 13zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 13h-6a1.502 1.502 0 0 0-1.5 1.5v6a1.502 1.502 0 0 0 1.5 1.5h6a1.502 1.502 0 0 0 1.5-1.5v-6a1.502 1.502 0 0 0-1.5-1.5zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5z"
										/><path fill="none" d="M0 0h24v24H0z" /></g
									></svg
								></span
							> <span>Actions</span>
						</div>
					</th>
				</tr>
			</thead>

			<tbody>
				{#each $magazine as item, index (item.id)}
					<tr>
						<td class="p-3 bg-gray-10 border border-gray-200 table-cell">
							<span>{calculateIndex(index)}</span>
						</td>

						<td class="p-3 bg-gray-10 border border-gray-200 table-cell">
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
						{#if item.magazine_languages}
							<td
								class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-200 table-cell"
							>
								{#each item.magazine_languages as lang}
									<div>
										{lang.title}
									</div>
								{/each}
							</td>
							<td
								class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-200 table-cell"
							>
								{#each item.magazine_languages as lang}
									<div>
										{lang.short_description?.slice(0, 40)}
									</div>
								{/each}
							</td>
							<td
								class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-200 table-cell"
							>
								{#each item.magazine_languages as lang}
									<div>
										{extractText(lang.long_description)?.slice(0, 40)}
									</div>
								{/each}
							</td>
						{/if}
						<td class="p-3 font-medium bg-gray-10 text-gray-600 border border-gray-200 table-cell">
							<div class="flex items-center">
								<button
									on:click={() => {
										goto(`/dashboard/magazine/${item.id}`);
									}}
									class="text-green-400 hover:text-green-600 underline"
								>
									Edit</button
								>

								<button
									on:click={() => handleDelete(item.id)}
									class="text-red-400 hover:text-red-600 underline pl-6"
								>
									Remove</button
								>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Add pagination -->
	<div class="py-5 flex justify-end items-center">
		<button
			on:click={() => goToPage(currentPage - 1)}
			disabled={currentPage === 1}
			class="border bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-l-md"
		>
			<div>
				<svg
					width="20px"
					height="20px"
					viewBox="0 0 1024 1024"
					class="icon"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					fill="#65686c"
					><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
						id="SVGRepo_tracerCarrier"
						stroke-linecap="round"
						stroke-linejoin="round"
					/><g id="SVGRepo_iconCarrier"
						><path
							d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
							fill="#65686c"
						/></g
					></svg
				>
			</div>
		</button>

		<div>
			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
				<button
					class={`px-4 py-2 border ${
						page === currentPage ? ' bg-primary text-white' : 'bg-white hover:bg-gray-300'
					}`}
					on:click={() => goToPage(page)}
				>
					{page}
				</button>
			{/each}
		</div>

		<button
			on:click={() => goToPage(currentPage + 1)}
			class="border bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-r-md"
			disabled={currentPage == totalPages}
		>
			<div>
				<svg
					width="20px"
					height="20px"
					viewBox="0 0 1024 1024"
					class="icon"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					fill="#000000"
					><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
						id="SVGRepo_tracerCarrier"
						stroke-linecap="round"
						stroke-linejoin="round"
					/><g id="SVGRepo_iconCarrier"
						><path
							d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
							fill="#65686c"
						/></g
					></svg
				>
			</div>
		</button>
	</div>
</div>

<!-- Pagination -->
