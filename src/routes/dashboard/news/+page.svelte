<script lang="ts">
	import {
		Button,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { paginationData, getNews } from '../../../stores/news';
	import news from '../../../stores/news';
	import Pagination from '$lib/components/reusables/pagination.svelte';
	import { goto } from '$app/navigation';
	import { Trash, InformationCircle, PencilSquare } from 'svelte-heros-v2';

	export let data;
	$: ({ supabase } = data);
	$: {
		getNews(0, 5, supabase);
	}

	$: newsData = $news ?? [];
	function createNews() {
		goto('/dashboard/create_news');
	}
</script>

<div
	class="w-full bg-white p-10 flex flex-col justify-between"
	style="min-height: calc(100vh - 300px);"
>
	<div class=" flex justify-center">
		<div class="w-full lg:w-8/12">
			<div class="py-10 flex justify-end">
				<Button   on:click={createNews}>Create News</Button>
			</div>
			<Table>
				<TableHead>
					<TableHeadCell>Title</TableHeadCell>
					<TableHeadCell>Date</TableHeadCell>
					<TableHeadCell>thumbnail</TableHeadCell>
					<TableHeadCell>Actions</TableHeadCell>
					<TableHeadCell>
						<span class="sr-only"> Edit </span>
					</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each newsData as item}
						<TableBodyRow>
							<TableBodyCell>{item.title}</TableBodyCell>
							<TableBodyCell>{item.short_description}</TableBodyCell>
							<TableBodyCell>
								<img
									class="w-20 h-14 rounded-md"
									src={item.thumbnail
										? `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${item.thumbnail}`
										: 'https://images.hindustantimes.com/img/2022/08/07/1600x900/cat_1659882617172_1659882628989_1659882628989.jpg'}
									alt=""
								/>
							</TableBodyCell>
							<TableBodyCell>
								<div class="flex">
									<div
										class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
									>
										<Trash class="text-red-800" />
									</div>
									<div
										class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
									>
										<InformationCircle class="text-blue-800" />
									</div>
									<div
										class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
									>
										<PencilSquare />
									</div>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
			<div class="py-10 flex justify-center w-full">
				<Pagination paginationData={$paginationData} />
			</div>
			<div class="flex justify-end items-end">
				<Button
					outline
					on:click={() => {
						goto('/dashboard/web_builder/news');
					}}>Go to Design Page</Button
				>
			</div>
		</div>
	</div>
</div>
