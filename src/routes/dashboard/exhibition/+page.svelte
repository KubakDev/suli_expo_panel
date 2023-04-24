<script>
	import {
		Button,
		Modal,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import news from '../../../stores/news';
	import CreateNews from '$lib/components/news/createNews.svelte';
	import { newsCollection, showDeleteModal, paginationData } from '../../../stores/news';
	// import BsTrash from 'svelte-icons-pack/bs/BsTrash';
	// import FiEdit from 'svelte-icons-pack/fi/FiEdit';
	import loading from '../../../stores/loading';
	import Pagination from '$lib/components/reusables/pagination.svelte';

	$: deleteModal = $showDeleteModal;
	console.log($news);
	let addNewsModal = false;
	$: newsData = $news ?? [];
	function closeModal() {
		console.log('close');
		addNewsModal = false;
	}
	function openModal() {
		newsCollection.toggleModal(true);
	}
	let selectedItem = { id: 0 };
	function deleteItem() {
		newsCollection.deleteNews(selectedItem.id);
	}
</script>

<div class="w-full bg-white p-10" style="min-height: calc(100vh - 300px);">
	<div class="py-10 flex justify-end">
		<Button on:click={openModal}>add</Button>
	</div>
	<Table>
		<TableHead>
			<TableHeadCell>Title</TableHeadCell>
			<TableHeadCell>Date</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
			<TableHeadCell>Image</TableHeadCell>
			<TableHeadCell>
				<span class="sr-only"> Edit </span>
			</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each newsData as item}
				<TableBodyRow>
					<TableBodyCell>{item.title}</TableBodyCell>
					<TableBodyCell>{item.created_at}</TableBodyCell>
					<TableBodyCell>{item}</TableBodyCell>
					<TableBodyCell>
						<div class="flex">
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
							>
								<!-- <Icon src={FiEdit} size="1.2rem" className="text-info" /> -->
							</div>
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
								on:click={() => (newsCollection.toggleDeleteModal(true), (selectedItem = item))}
							>
								<!-- <Icon src={BsTrash} size="1.2rem" className="text-danger" /> -->
							</div>
						</div>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
	<div class="py-10 flex justify-center w-full">
		<!-- <Pagination paginationData={$paginationData} /> -->
	</div>
	<CreateNews on:hide={closeModal} />
	<Modal bind:open={deleteModal} size="xs" backdropClose={false}>
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
				Are you sure you want to delete this item?
			</h3>
			<Button color="red" class="mr-2" on:click={deleteItem}
				>{#if $loading}
					<Spinner class="mr-3" size="4" />
				{/if}Yes, I'm sure</Button
			>
			<Button color="alternative">No, cancel</Button>
		</div>
	</Modal>
</div>
