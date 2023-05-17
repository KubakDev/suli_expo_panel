<script>
	// @ts-nocheck
	import { Pagination } from 'flowbite-svelte';
	export let paginationData;

	let pages = [];
	$: pagesName = pages;
	$: {
		pages = [];
		if (paginationData.pages)
			for (let page of paginationData.pages) {
				pages.push({ name: page, active: paginationData.currentPage == page });
			}
		pagesName = pages;
	}
	const previous = () => {
		alert('Previous btn clicked. Make a call to your server to fetch data.');
	};
	const next = () => {
		alert('Next btn clicked. Make a call to your server to fetch data.');
	};
	function paginate(e) {
		console.log(e);
	}
</script>

<Pagination pages={pagesName} on:previous={previous} on:next={next} on:change={paginate} />
