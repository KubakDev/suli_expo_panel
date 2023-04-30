<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi } from 'flowbite-svelte';

	import '../styles.scss';
	import '../../app.postcss';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';
	export let data: PageData;
	let activeUrl: string;
	$: if ($page.url) {
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
		<Navbar let:hidden let:toggle style="background-color: #f1f3f4 !important;">
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
