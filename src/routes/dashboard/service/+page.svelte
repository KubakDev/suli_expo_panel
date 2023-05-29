<script lang="ts">
	import {
		Button,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { Trash, InformationCircle } from 'svelte-heros-v2';
	import service, { getAllServices } from '../../../stores/service';

	export let data;
	$: ({ supabase } = data);
	$: {
		getAllServices(supabase);
	}

	function createService() {
		goto('/dashboard/create_service');
	}
	let popupModal = false;
	let selectedServiceId = 0;
</script>

<Modal bind:open={popupModal} size="xs" autoclose>
	<div class="text-center">
		<svg
			aria-hidden="true"
			class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/></svg
		>
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Are you sure you want to delete this items?
		</h3>
		<Button color="red" class="mr-2" on:click={() => {}}>Yes, I'm sure</Button>
		<Button color="alternative">No, cancel</Button>
	</div>
</Modal>
<div
	class="w-full bg-white p-10 flex flex-col justify-between"
	style="min-height: calc(100vh - 300px);"
>
	<div class=" flex justify-center">
		<div class="w-full lg:w-8/12">
			<div class="py-10 flex justify-end">
				<Button on:click={createService}>Create Service</Button>
			</div>
			<Table>
				<TableHead>
					<TableHeadCell>Title</TableHeadCell>
					<TableHeadCell>Short Description</TableHeadCell>
					<TableHeadCell>thumbnail</TableHeadCell>
					<TableHeadCell>Actions</TableHeadCell>
					<TableHeadCell>
						<span class="sr-only"> Edit </span>
					</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each $service as item}
						<TableBodyRow>
							<TableBodyCell>{item?.service_languages[0]?.title}</TableBodyCell>
							<TableBodyCell tdClass="w-[300px]"
								>{item?.service_languages[0]?.short_description}</TableBodyCell
							>
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
										<Trash
											class="text-red-800"
											on:click={() => {
												popupModal = true;
												selectedServiceId = item.id ?? 0;
											}}
										/>
									</div>
									<div
										class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
									>
										<InformationCircle
											class="text-blue-800"
											on:click={() => {
												goto(`/dashboard/service/${item.id}`);
											}}
										/>
									</div>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>

			<div class="flex justify-end items-end">
				<Button
					outline
					on:click={() => {
						goto('/dashboard/web_builder/service');
					}}>Go to Design Page</Button
				>
			</div>
		</div>
	</div>
</div>
