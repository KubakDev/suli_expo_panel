<script lang="ts">
	import { onMount } from 'svelte';
	export let src: string;
	export let size: { width: number; height: number } | null = null;

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

{#if loaded}
	<img {src} alt="Document" class={size ? `w-[${size.width}px] h-[${size.height}px]` : ''} />
{:else if failed}
	<img
		src="https://icon-library.com/images/not-found-icon/not-found-icon-20.jpg"
		alt="Not Found"
		class={size ? `w-[${size.width}px] h-[${size.height}px]` : ''}
	/>
{:else if loading}
	<img
		src="https://c.tenor.com/On7kvXhzml4AAAAi/loading-gif.gif"
		alt="Loading..."
		class={size ? `w-[${size.width}px] h-[${size.height}px]` : ''}
	/>
{/if}
