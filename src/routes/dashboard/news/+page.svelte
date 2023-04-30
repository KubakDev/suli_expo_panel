<script lang="ts">
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
	import CreateNews from '$lib/components/news/createNews.svelte';
	import { newsCollection, showDeleteModal, paginationData } from '../../../stores/news';
	import news from '../../../stores/news';
	import { supabase } from '../../../supabase';
	import loading from '../../../stores/loading';
	import Pagination from '$lib/components/reusables/pagination.svelte';

	import { goto } from '$app/navigation';

	$: deleteModal = $showDeleteModal;
	let addNewsModal = false;
	$: newsData = $news ?? [];

	function closeModal() {
		addNewsModal = false;
	}
	function openModal() {
		newsCollection.toggleModal(true);
	}
	let selectedItem = { id: 0 };
	function deleteItem() {
		newsCollection.deleteNews(selectedItem.id);
	}
	let fileInput: any = null;
	async function uploadImage() {
		const file = fileInput?.files[0];

		const { data, error } = await supabase.storage
			.from('image')
			.upload(`images/${file.name}`, file);
	}
</script>

<form on:submit|preventDefault={uploadImage}>
	<input type="file" bind:this={fileInput} accept="image/*" />
	<button type="submit">Upload</button>
</form>
