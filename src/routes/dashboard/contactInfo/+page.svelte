<script lang="ts">
	import { onMount } from 'svelte';
	import { contactData, getData, deleteData } from '../../../stores/contactStor';
	import { goto } from '$app/navigation';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	import {  
		IconPhone,
		IconGridDots,
		IconEdit
	} from '@tabler/icons-svelte';
	import InsertButton from '$lib/components/InsertButton.svelte';


	export let data;

	async function fetchData() {
		await getData(data.supabase);
	}

	onMount(fetchData);

	function createContact() {
		goto('/dashboard/create_contactInfo');
	}

	// delete data
	async function handleDelete(contactInfo_id: number) {
		try {
			await deleteData(contactInfo_id, data.supabase);
			await fetchData();
		} catch (error) {}
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- insert new data -->
	<InsertButton insertData={createContact} />

	<!-- table data -->
	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse dark:border-gray-700">
					<thead>
						<tr>
							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-start items-center gap-2">
									 <span>Email</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex items-center gap-2">
								 	<span>Location</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex items-center gap-2">
									 <span>phoneNumber_relations</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex items-center gap-2">
								 	<span>phoneNumber_Technical</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex items-center gap-2">
									 <span>phoneNumber_Administration</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex items-center gap-2">
									 <span>phoneNumber_marketing</span>
								</div>
							</th>

							<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex items-start gap-2">
									<IconGridDots size={20} class="text-gray-600 dark:text-gray-300" />
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>

					<tbody>
						{#each $contactData as item, index (item.id)}
							<tr>
								{#if item.contact_info_languages}
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.contact_info_languages as lang}
											<div class="text-gray-600 dark:text-gray-300">
												{lang.email}
											</div>
										{/each}
									</td>
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.contact_info_languages as lang}
											<div class="text-gray-600 dark:text-gray-300">
												{lang.location}
											</div>
										{/each}
									</td>
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.contact_info_languages as lang}
											<div class="text-gray-600 dark:text-gray-300">
												{lang.phoneNumber_relations}
											</div>
										{/each}
									</td>
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.contact_info_languages as lang}
											<div class="text-gray-600 dark:text-gray-300">
												{lang.phoneNumber_Technical}
											</div>
										{/each}
									</td>
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.contact_info_languages as lang}
											<div class="text-gray-600 dark:text-gray-300">
												{lang.phoneNumber_Administration}
											</div>
										{/each}
									</td>
									<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
										{#each item.contact_info_languages as lang}
											<div class="text-gray-600 dark:text-gray-300">
												{lang.phoneNumber_marketing}
											</div>
										{/each}
									</td>
								{/if}
								<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell w-32">
									<div class="flex justify-center items-center gap-2">
										<button
											on:click={() => {
												goto(`/dashboard/contactInfo/${item.id}`);
											}}
											class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2"
										>
											Edit
											<IconEdit size={20} class="text-green-500" />
										</button>

										<DeleteModal itemIdToDelete={item.id} {handleDelete} />
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
