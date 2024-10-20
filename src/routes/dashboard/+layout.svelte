<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
		Dropdown,
		DropdownItem,
		Chevron
	} from 'flowbite-svelte';
	import { DarkMode } from 'flowbite-svelte';
	import '../styles.scss';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';

	export let data: PageData;
	let activeUrl: string;

	onMount(() => {
		activeUrl = $page.url.pathname;
	});

	function getTheme() {
		let themeArray = [];
		for (let theme of data.colorTheme) {
			themeArray.push(`${theme.name}:${theme.color}`);
		}
		return themeArray.join(';');
	}

	$: activeUrl = $page.url.pathname;

	function updateActiveUrl(url: string) {
		activeUrl = url;
	}
</script>

<style>
	/* Optional: Add any additional custom styles here */
</style>

<div class="app min-h-screen flex flex-col" style={getTheme()}>
	{#if !$page.url.pathname.startsWith('/dashboard/seats_ui')}
		<Navbar class="dark:bg-gray-900 bg-gray-800 border-b border-gray-700 shadow-lg" let:hidden let:toggle>
			<NavBrand href="/dashboard">
				<span class="self-center whitespace-nowrap text-2xl font-bold text-white">
					SulyExpo
				</span>
			</NavBrand>

			<div class="flex items-center space-x-4 md:space-x-6">
				<DarkMode class="text-2xl" />
				<form action="/?/signout" method="POST">
					<button
						type="submit"
						class="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
					>
						<span class="inline-flex items-center gap-2">
							Logout
							<svg
								class="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
						</span>
					</button>
				</form>
				<NavHamburger on:click={toggle} />
			</div>

			<NavUl
				{hidden}
				divClass="w-full lg:block lg:w-auto transition-all duration-300"
				nonActiveClass="text-gray-300 hover:bg-gray-700 hover:text-white font-medium lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-500 transition-colors"
				activeClass="text-primary-500 font-semibold bg-gray-700 lg:bg-transparent"
				ulClass="flex flex-col	items-center p-4 mt-4 space-y-2 rounded-lg bg-gray-800 lg:flex-row lg:space-x-6 lg:mt-0 lg:text-sm lg:font-medium"
				class="order-1"
			>
				{#each data.pages as page}
					{#if page.children && page.children.length > 0}
						<div class="relative group">
							<button
								class="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white transition-colors"
							>
								<span>{page.title}</span>
								<Chevron class="ml-2 transition-transform group-hover:rotate-180" />
							</button>
							<Dropdown class="absolute left-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
								{#each page.children as item}
									<DropdownItem
										on:click={() => {
											updateActiveUrl(item.url);
											goto(item.url);
										}}
										class="px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
									>
										{item.title}
									</DropdownItem>
								{/each}
							</Dropdown>
						</div>
					{:else}
						<NavLi
							class="px-3 py-2 rounded-md cursor-pointer"
							on:click={() => {
								updateActiveUrl(page.url + '');
								goto(page.url + '');
							}}
							active={activeUrl === page.url}
							style={activeUrl === page.url ? '' : 'color:#e9ecef'}
						>
						 	{page.title}
						</NavLi>
					{/if}
				{/each}
			</NavUl>
		</Navbar>
	{/if}

	<main class="flex-1 p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
		<slot />
	</main>
</div>
