<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Photo } from 'svelte-heros-v2';

	let fileInput: any;
	const dispatch = createEventDispatcher();

	function handleClick() {
		fileInput.click();
	}

	function handleChange(event: any) {
		const files = Array.from(event.target.files);
		dispatch('filesselected', files);
	}
</script>

<label class="upload-btn">
	<input type="file" multiple on:change={handleChange} hidden bind:this={fileInput} />
	<button on:click={handleClick}><Photo /> Upload</button>
</label>

<style>
	.upload-btn {
		/* your custom styles for the upload button */
	}
</style>
