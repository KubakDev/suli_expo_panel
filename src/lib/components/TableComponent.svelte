<script lang="ts">
	import { goto } from '$app/navigation'; 
	import DeleteModal from './DeleteModal.svelte';
	// Import Tabler icons
	import { IconGridDots, IconEdit } from '@tabler/icons-svelte';

	export let calculateIndex: (index: number) => number;
	export let handleDelete: (id: number) => Promise<void>;
	export let pageName: string;
	export let data: any;
	export let columnTitle: { header: string; name: string; type: string; subField?: string }[];

	// convert html tag that return it from db to regular text
	function extractText(html: string): string {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;
		return tempElement.textContent || tempElement.innerText || '';
	}
</script>

<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
	<div class="overflow-x-auto rounded">
		<div class="min-w-full table-responsive">
			<table class="min-w-full border-collapse dark:border-gray-700">
				<thead>
					<tr>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell w-10"
						>
							<div class="flex justify-center items-center gap-2">
								<span>#</span>
							</div>
						</th>

						{#each columnTitle as column}
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
							>
								<div class="flex justify-center items-center gap-2">
									<span>{column.header}</span>
								</div>
							</th>
						{/each}

						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell"
						>
							<div class="flex items-center gap-2">
								<IconGridDots size={20} class="text-gray-600 dark:text-gray-300" />
								<span>Actions</span>
							</div>
						</th>
					</tr>
				</thead>

				<tbody>
					{#each data as item, index (item.id)}
						<tr>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
								<span class="flex justify-center text-gray-700 dark:text-gray-300 font-semibold"
									>{calculateIndex(index)}</span
								>
							</td>

							{#each columnTitle as column}
								<td
									class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell"
								>
									<div>
										{#if column.type === 'image'}
											{#if item[column.name]}
												<div>
													<img
														class="w-20 h-20 object-cover rounded"
														src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
															item[column.name]
														}`}
														alt="thumbnail"
													/>
												</div>
											{/if}
										{:else if column.type === 'array'}
											{#if column.subField === 'short_description'}
												{#each item[column.name] as lang}
													<div>{lang.short_description.slice(0, 50)}</div>
												{/each}
											{:else if column.subField === 'long_description'}
												{#each item[column.name] as lang}
													<div>{extractText(lang.long_description.slice(0, 70))}</div>
												{/each}
											{/if}
										{:else if column.type === 'title'}
											{#each item[column.name] as lang}
												<div>{lang.title.slice(0, 50)}</div>
											{/each}
										{:else if column.type === 'subtitle'}
											{#each item[column.name] as lang}
												<div>{lang.subtitle.slice(0, 70)}</div>
											{/each}
										{:else if column.type === 'link'}
											{#each item[column.name] as lang}
												<div>{lang.video_link.slice(0, 50)}</div>
											{/each}
										{:else if column.type === 'name'}
											{#each item[column.name] as lang}
												<div>{lang.name.slice(0, 50)}</div>
											{/each}
										{:else if column.type === 'description'}
											{#each item[column.name] as lang}
												<div>{lang.description.slice(0, 70)}</div>
											{/each}
										{/if}
									</div>
								</td>
							{/each}

							<td
								class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell w-32"
							>
								<div class="flex justify-center items-center gap-2">
									<button
										on:click={() => {
											goto(`/dashboard/${pageName}/${item.id}`);
										}}
										class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2"
									>
										Edit
										<IconEdit size={20} class="text-green-500" />
									</button>

									{#if pageName !== 'about'}
										<DeleteModal itemIdToDelete={item.id} {handleDelete} />
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
