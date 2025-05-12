<script lang="ts">
	import { goto } from '$app/navigation'; 
	import DeleteModal from './DeleteModal.svelte';
	// Import Tabler icons
	import { IconGridDots, IconEdit } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

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
	<div class="overflow-x-auto rounded-lg shadow-lg">
		<div class="min-w-full table-responsive">
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th
							class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell w-10"
						>
							<div class="flex justify-center items-center gap-2">
								<span>#</span>
							</div>
						</th>

						{#each columnTitle as column}
							<th
								class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-r border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex justify-center items-center gap-2">
									<span>{column.header}</span>
								</div>
							</th>
						{/each}

						<th
							class="p-3 font-semibold uppercase bg-[{THEME_COLORS.LIGHT.TABLE_HEADER}] dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-800 table-cell"
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
						<tr class="hover:bg-gray-100 dark:hover:bg-[#2a3038] transition-colors">
							<td class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-b border-r border-gray-200 dark:border-gray-800 table-cell">
								<span class="flex justify-center text-gray-700 dark:text-gray-300 font-semibold"
									>{calculateIndex(index)}</span
								>
							</td>

							{#each columnTitle as column}
								<td
									class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800 table-cell"
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
										{:else if column.type === 'email'}
											{#each item[column.name] as lang}
												<div>{lang.email}</div>
											{/each}
										{:else if column.type === 'location'}
											{#each item[column.name] as lang}
												<div>{lang.location}</div>
											{/each}
										{:else if column.type === 'phoneNumber_relations'}
											{#each item[column.name] as lang}
												<div>{lang.phoneNumber_relations}</div>
											{/each}
										{:else if column.type === 'phoneNumber_Technical'}
											{#each item[column.name] as lang}
												<div>{lang.phoneNumber_Technical}</div>
											{/each}
										{:else if column.type === 'phoneNumber_Administration'}
											{#each item[column.name] as lang}
												<div>{lang.phoneNumber_Administration}</div>
											{/each}
										{:else if column.type === 'phoneNumber_marketing'}
											{#each item[column.name] as lang}
												<div>{lang.phoneNumber_marketing}</div>
											{/each}
										{/if}
									</div>
								</td>
							{/each}

							<td
								class="p-3 bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 table-cell w-32"
							>
								<div class="flex justify-center items-center gap-2">
									<button
										on:click={() => {
											goto(`/dashboard/${pageName}/${item.id}`);
										}}
										class="text-gray-400 p-1 border border-gray-500 dark:border-gray-600 rounded flex gap-2 hover:bg-gray-200 dark:hover:bg-[#2c3440] transition-colors"
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
