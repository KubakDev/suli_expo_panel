<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi } from 'flowbite-svelte';

	import './styles.scss';
	import '../app.postcss';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	export let data: PageData;
	let activeUrl: string;
	$: if ($page.url) {
		page.subscribe((value) => {
			// console.log(value);
		});
		console.log(data.primaryColor);
		console.log($page.url.pathname);
		activeUrl = $page.url.pathname;
	}
	function getTheme() {
		let themeArray = [];
		for (let theme of data.colorTheme) {
			themeArray.push(`${theme.name}:${theme.color}`);
		}
		return themeArray.join(';');
	}
</script>

<div class="app" style={getTheme()}>
	<main>
		<Navbar let:hidden let:toggle>
			<NavBrand>
				<span class="self-center whitespace-nowrap text-xl font-semibold"> SuliExpo </span>
			</NavBrand>
			<NavHamburger on:click={toggle} />
			<NavUl {hidden}>
				{#each data.pages as page}
					<NavLi
						class="cursor-pointer"
						on:click={() => {
							goto(page.url);
						}}
						active={activeUrl == page.url}>{page.title}</NavLi
					>
				{/each}
			</NavUl>
		</Navbar>
		{#if $page.url.pathname == '/web_builder'}
			<div class="">
				<slot />
			</div>
		{:else}
			<div class="p-10">
				<slot />
			</div>
		{/if}
	</main>
</div>

<style>
	/* .app {
		background-color: var(--primary-color);
	} */
</style>
