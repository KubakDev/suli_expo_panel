<script lang="ts">
	import { Label, Input, Button, Modal, Textarea, Select, Spinner } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';
	import { showModal, newsCollection } from '../../../stores/news';
	import loading from '../../../stores/loading';

	$: showNewsModal = $showModal;
	const dispatch = createEventDispatcher();
	let newsData = {
		title: '',
		description: ''
	};
	function handleClose() {
		newsCollection.toggleModal(false);
		dispatch('hide');
	}
	const handleSubmit = () => {
		newsCollection.addNewNews(newsData);
	};
</script>

<Modal title="Add News" bind:open={showNewsModal} on:hide={handleClose} class="min-w-full">
	<form on:submit={handleSubmit}>
		<div class="grid gap-4 mb-4 sm:grid-cols-2">
			<div>
				<Label for="price" class="mb-2">Title</Label>
				<Input type="text" id="price" placeholder="add title" bind:value={newsData.title} />
			</div>
			<div class="sm:col-span-2">
				<Label for="description" class="mb-2">Description</Label>
				<Textarea
					id="description"
					placeholder="Your description here"
					rows="4"
					name="description"
					bind:value={newsData.description}
				/>
			</div>
			<Button type="submit" class="w-52">
				{#if $loading}
					<Spinner class="mr-3" size="4" />
				{:else}
					<svg
						class="mr-1 -ml-1 w-6 h-6"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
							clip-rule="evenodd"
						/></svg
					>
				{/if}

				Add new News
			</Button>
		</div>
	</form>
</Modal>
