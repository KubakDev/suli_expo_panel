<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi } from 'flowbite-svelte';
	import './styles.scss';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	export let data: PageData;
	let activeUrl: string;

	$: if ($page.url) {
		page.subscribe((value) => {
			console.log(value);
		});
		console.log(data);
		console.log($page.url.pathname);
		activeUrl = $page.url.pathname;
	}
</script>

<div class="app">
	<main>
		<Navbar let:hidden let:toggle>
			<NavBrand>
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
					SuliExpo
				</span>
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
		<div class="">
			<slot />
		</div>
	</main>
</div>
