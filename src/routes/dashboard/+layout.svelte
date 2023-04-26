<script lang="ts">
	import { Navbar, NavBrand, NavHamburger, NavUl, NavLi } from 'flowbite-svelte';

	import '../styles.scss';
	import '../../app.postcss';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { supabase } from '../../supabase';
	import { redirect } from '@sveltejs/kit';
	export let data: PageData;
	let activeUrl: string;
	$: if ($page.url) {
		activeUrl = $page.url.pathname;
	}

	if (typeof window !== 'undefined') {
		supabase.auth.getSession().then((response) => {
			console.log(response.data.session);
			if (!response.data.session) {
				console.log('sessionnnnnnnnnnn');
				goto('/');
			}
		});
	}
	// checkUser();
	// async function checkUser() {
	// 	const {
	// 		data: { session }
	// 	} = await supabase.auth.getSession();
	// 	console.log(session);
	// 	if (!session) {
	// 		console.log('no session');
	// 		// goto('/');
	// 		// throw redirect(303, '/');
	// 	}
	// }
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
		{#if $page.url.pathname.includes('/web_builder')}
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
