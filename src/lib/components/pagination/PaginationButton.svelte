<script>
	export let page;
	export let currentPage;
	export let onClick;
</script>

<button
	class={`px-4 py-2 border ${
		page === currentPage ? 'bg-primary text-white' : 'bg-white hover:bg-gray-300'
	}`}
	on:click={onClick}
>
	{page}
</button>
