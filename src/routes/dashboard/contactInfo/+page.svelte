<script lang="ts">
	import { onMount } from 'svelte';
	import { contactData, getData, deleteData } from '../../../stores/contactStor';
	import { goto } from '$app/navigation';
	import { Button, Modal } from 'flowbite-svelte';
	let open = false;
	let color: any = '';
	let itemIdToDelete: any = null;

	export let data;
	let contactInfo_Data = [];

	// console.log('//', contactData);

	async function fetchData() {
		let result = await getData(data.supabase);
		contactInfo_Data = result;

		contactData.set(contactInfo_Data);
		// console.log('contact Information ///////', contactInfo_Data);
	}

	onMount(fetchData);

	function createContact() {
		goto('/dashboard/create_contactInfo');
	}

	// delete data
	async function handleDelete(contactInfo_id) {
		try {
			await deleteData(contactInfo_id, data.supabase);
			await fetchData();
		} catch (error) {
			console.error('Error deleting Information:', error);
		}
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<div class="py-5 flex justify-end">
		<Button on:click={createContact} class="bg-primary-dark hover:bg-primary-50 flex gap-2">
			<svg
				width="20px"
				height="20px"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				fill="#000000"
				><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				/><g id="SVGRepo_iconCarrier">
					<title />
					<g id="Complete">
						<g data-name="add" id="add-2">
							<g>
								<line
									fill="none"
									stroke="#ffffff"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									x1="12"
									x2="12"
									y1="19"
									y2="5"
								/>
								<line
									fill="none"
									stroke="#ffffff"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									x1="5"
									x2="19"
									y1="12"
									y2="12"
								/>
							</g>
						</g>
					</g>
				</g></svg
			>Add Contact Information
		</Button>
	</div>

	<!-- table data -->
	<div class="max-w-screen-2xl mx-auto">
		<div class="overflow-x-auto">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th
								class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
							>
								<div class="flex justify-start items-center gap-2">
									<span>Email</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Location</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
							>
								<div class="flex items-start gap-2">
									<span>phoneNumber_relations</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>phoneNumber_Technical</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>phoneNumber_Administration</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>phoneNumber_marketing</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-gray-100 text-gray-700 text-sm border border-gray-200 table-cell"
							>
								<div class="flex items-start gap-2">
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>

					<tbody>
						{#each $contactData as item, index (item.id)}
							<tr>
								{#if item.contact_info_languages}
									<td class="p-3 font- bg-gray-10 text-gray-600 border border-gray-200 table-cell">
										{#each item.contact_info_languages as lang}
											<div>
												{lang.email}
											</div>
										{/each}
									</td>
									<td class="p-3 font- bg-gray-10 text-gray-600 border border-gray-200 table-cell">
										{#each item.contact_info_languages as lang}
											<div>
												{lang.location}
											</div>
										{/each}
									</td>
									<td class="p-3 font- bg-gray-10 text-gray-600 border border-gray-200 table-cell">
										{#each item.contact_info_languages as lang}
											<div>
												{lang.phoneNumber_relations}
											</div>
										{/each}
									</td>
									<td class="p-3 font- bg-gray-10 text-gray-600 border border-gray-200 table-cell">
										{#each item.contact_info_languages as lang}
											<div>
												{lang.phoneNumber_Technical}
											</div>
										{/each}
									</td>
									<td class="p-3 font- bg-gray-10 text-gray-600 border border-gray-200 table-cell">
										{#each item.contact_info_languages as lang}
											<div>
												{lang.phoneNumber_Administration}
											</div>
										{/each}
									</td>
									<td class="p-3 font- bg-gray-10 text-gray-600 border border-gray-200 table-cell">
										{#each item.contact_info_languages as lang}
											<div>
												{lang.phoneNumber_marketing}
											</div>
										{/each}
									</td>
								{/if}
								<td class="p-3 bg-gray-10 text-gray-600 border border-gray-200 table-cell">
									<div class="flex items-center">
										<button
											on:click={() => {
												goto(`/dashboard/contactInfo/${item.id}`);
											}}
											class="text-green-400 hover:text-green-600 hover:underline"
										>
											Edit</button
										>

										<button
											color="red"
											on:click={() => {
												color = 'red';
												open = true;
												itemIdToDelete = item.id;
											}}
											class="text-red-400 hover:text-red-600 hover:underline pl-6"
										>
											Remove</button
										>

										<Modal
											title="Are you sure?"
											bind:open
											{color}
											class="bg-white max-w-sm mx-auto"
											autoclose
										>
											<div class="text-base leading-relaxed">
												Do you really want to delete these records? This process can not be undone.
											</div>
											<svelte:fragment slot="footer">
												<Button on:click={() => handleDelete(itemIdToDelete)} {color}>Delete</Button
												>
												<Button color="alternative" class="hover:text-gray-700">Cancel</Button>
											</svelte:fragment>
										</Modal>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
