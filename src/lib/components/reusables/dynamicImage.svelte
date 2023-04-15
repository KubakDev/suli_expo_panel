<script lang="ts">
	import { onMount } from 'svelte';
	export let src: string;
	export let size: string | null;

	let loaded = false;
	let failed = false;
	let loading = false;

	onMount(() => {
		const img = new Image();
		img.src = src;
		loading = true;

		img.onload = () => {
			loading = false;
			loaded = true;
		};
		img.onerror = () => {
			loading = false;
			failed = true;
		};
	});
</script>

<div class={size}>
	{#if loaded}
		<img {src} alt="Document" />
	{:else if failed}
		<img
			src="https://icon-library.com/images/not-found-icon/not-found-icon-20.jpg"
			alt="Not Found"
		/>
	{:else if loading}
		<img
			style="height: 20px;"
			src="https://c.tenor.com/On7kvXhzml4AAAAi/loading-gif.gif"
			alt="Loading..."
		/>
	{/if}
</div>
