<script lang="ts">
	import { Modal, Button } from 'flowbite-svelte';
	export let itemIdToDelete: number | undefined;
	export let handleDelete: any;

	let open = false;
	let color = '';

	function handleDeleteClick() {
		handleDelete(itemIdToDelete);
		open = false;
	}
</script>

<div class="flex items-center">
	<button
		color="red"
		on:click={() => {
			color = 'red';
			open = true;
		}}
		class="text-red-400 hover:text-red-600 hover:underline pl-6"
	>
		Remove
	</button>

	<Modal title="Are you sure?" bind:open {color} class="bg-white max-w-sm mx-auto" autoclose>
		<div class="text-base leading-relaxed">
			Do you really want to delete these records? This process cannot be undone.
		</div>
		<svelte:fragment slot="footer">
			<Button on:click={handleDeleteClick} {color}>Delete</Button>
			<Button color="alternative" class="hover:text-gray-700">Cancel</Button>
		</svelte:fragment>
	</Modal>
</div>
