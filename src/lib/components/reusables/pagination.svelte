<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { Pagination } from 'flowbite-svelte';
	$: activeUrl = $page.url.searchParams.get('page');
	export let paginationData;
	console.log(paginationData);
	let pages = [
		{ name: 1, href: '/components/pagination?page=1' },
		{ name: 2, href: '/components/pagination?page=2' },
		{ name: 3, href: '/components/pagination?page=3' },
		{ name: 4, href: '/components/pagination?page=4' },
		{ name: 5, href: '/components/pagination?page=5' }
	];
	const previous = () => {
		alert('Previous btn clicked. Make a call to your server to fetch data.');
	};
	const next = () => {
		alert('Next btn clicked. Make a call to your server to fetch data.');
	};
</script>

<Pagination {pages} on:previous={previous} on:next={next} />
