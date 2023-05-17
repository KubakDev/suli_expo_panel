<script lang="ts">
	import { onMount } from 'svelte';
	export let src: string;
	export let className: string | null;

	let loaded = false;
	let failed = false;
	let loading = false;
</script>

<div class={className}>
	<img {src} alt="Not Found" />
</div>
