<script lang="ts">
	import { goto } from '$app/navigation';
	import DeleteModal from './DeleteModal.svelte';
	//@ts-ignore
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import AiFillEdit from 'svelte-icons-pack/ai/AiFillEdit';

	export let calculateIndex: any;
	export let handleDelete: any;
	export let pageName: string;
	export let data: any;
	export let columnTitle: any;

	// convert html tag that return it from db to regular text
	function extractText(html: any) {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;
		return tempElement.textContent || tempElement.innerText || '';
	}
</script>

<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
	<div class="overflow-x-auto rounded">
		<div class="min-w-full table-responsive">
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell w-10"
						>
							<div class="flex justify-center items-center gap-2">
								<span>#</span>
							</div>
						</th>

						{#each columnTitle as column}
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex justify-center items-center gap-2">
									<span>{column.header}</span>
								</div>
							</th>
						{/each}

						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center gap-2">
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
					{#each data as item, index (item.id)}
						<tr>
							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<span class="flex justify-center text-gray-700 dark:text-gray-300 font-semibold"
									>{calculateIndex(index)}</span
								>
							</td>

							{#each columnTitle as column}
								<td
									class="p-3 font- bg-gray-10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell"
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
								class="p-3 font- bg-gray-10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell w-32"
							>
								<div class="flex justify-center items-center gap-2">
									<button
										on:click={() => {
											goto(`/dashboard/${pageName}/${item.id}`);
										}}
										class="text-gray-400 p-1 border border-gray-400 rounded flex gap-2"
									>
										Edit
										<span
											><Icon
												src={AiFillEdit}
												color="green"
												size="20"
												className="custom-icon"
												title="Custom icon params"
											/></span
										>
									</button>

									{#if pageName !== 'about' && pageName !== 'seatServices'}
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
