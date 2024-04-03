<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Photo } from 'svelte-heros-v2';

	let fileInput: HTMLInputElement;
	const dispatch = createEventDispatcher();

	function handleClick() {
		fileInput.click();
	}

	function handleChange(event: Event) {
		if (event.target instanceof HTMLInputElement) {
			const files = Array.from(event.target.files || []);
			dispatch('filesselected', files);
		}
	}
</script>

<label class="upload-btn">
	<input type="file" multiple on:change={handleChange} hidden bind:this={fileInput} />
	<button on:click={handleClick}><Photo /> Upload</button>
</label>

<style>
</style>
