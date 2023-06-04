<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi } from 'flowbite-svelte';

	import '../styles.scss';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	export let data: PageData;
	let activeUrl: string;

	onMount(() => {
		console.log($page.url);
		activeUrl = $page.url.pathname;
	});

	function getTheme() {
		let themeArray = [];
		for (let theme of data.colorTheme) {
			themeArray.push(`${theme.name}:${theme.color}`);
		}
		return themeArray.join(';');
	}

	function updateActiveUrl(url: string) {
		activeUrl = url;
		console.log(activeUrl);
	}
</script>

<div class="app" style={getTheme()}>
	<main>
		<Navbar let:hidden let:toggle style="background-color: #001d3d !important">
			<NavBrand>
				<span class="self-center whitespace-nowrap text-xl text-white"> SuliExpo </span>
			</NavBrand>
			<NavHamburger on:click={toggle} />
			<NavUl {hidden}>
				{#each data.pages as page}
					<NavLi
						class="cursor-pointer text-white"
						on:click={() => {
							updateActiveUrl(page.url);
							goto(page.url);
							console.log(page.url);
						}}
						active={activeUrl == page.url}>{page.title}</NavLi
					>
				{/each}
			</NavUl>
		</Navbar>
		{#if $page.url.pathname.includes('/web_builder')}
			<div>
				<slot />
			</div>
		{:else}
			<div class="p-10">
				<slot />
			</div>
		{/if}
	</main>
</div>
