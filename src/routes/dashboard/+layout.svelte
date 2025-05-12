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
	import { THEME_COLORS } from '$lib/utils/themeColors';
	import { IconLogout } from '@tabler/icons-svelte';

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
	.app {
		min-height: 100vh; /* Ensure it takes full height */
		margin: 0; /* Remove any margin */
		padding: 0; /* Remove any padding */
		display: flex;
		flex-direction: column; /* Ensure children stack vertically */
	}
</style>

<div class="app" style={getTheme()}>
	{#if !$page.url.pathname.startsWith('/dashboard/seats_ui')}
		<Navbar class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-b border-gray-200 dark:border-gray-800 shadow-lg" let:hidden let:toggle>
			<NavBrand href="/dashboard">
				<span class="self-center whitespace-nowrap text-2xl font-bold text-gray-800 dark:text-gray-100">
					SulyExpo
				</span>
			</NavBrand>

			<div class="flex items-center space-x-4 md:space-x-6">
				<DarkMode class="text-2xl" />
				<form action="/?/signout" method="POST">
					<button
						type="submit"
						class="flex items-center px-3 py-2 text-gray-500 dark:hover:text-white transition-colors duration-200"
					>
						<span class="inline-flex items-center gap-2">
							Logout
							<IconLogout size={20} />
						</span>
					</button>
				</form>
				<NavHamburger on:click={toggle} />
			</div>

			<NavUl
				{hidden}
				divClass="w-full lg:block lg:w-auto transition-all duration-300"
				nonActiveClass="hover:text-[#E5B167] dark:hover:text-[#E5B167] font-medium transition-colors"
				activeClass="text-[#E5B167] dark:text-[#E5B167] font-semibold"
				ulClass="flex flex-col items-stretch p-4 mt-4 space-y-2 rounded-lg bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] lg:flex-row lg:items-center lg:space-x-6 lg:space-y-0 lg:mt-0 lg:text-sm lg:font-medium border border-gray-200 dark:border-gray-800"
				class="order-1"
			>
				{#each data.pages as page}
					{#if page.children && page.children.length > 0}
						<div class="relative group h-full flex items-center">
							<button
							  style={activeUrl === page.url ? `color: ${THEME_COLORS.TEXT.ACTIVE};` : 'color: var(--text-light); @media (prefers-color-scheme: dark) { color: var(--text-dark); }'}
								class="flex items-center justify-between w-full px-3 py-2 transition-colors"
							>
								<span class="transition-colors ">{page.title}</span>
								<Chevron class="ml-2 transition-transform group-hover:rotate-180 text-gray-600 dark:text-gray-300" />
							</button>
							<Dropdown  class="absolute left-0 mt-2 w-64 bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 border border-gray-200 dark:border-gray-800"
							>
								{#each page.children as item}
									<DropdownItem
										on:click={() => {
											updateActiveUrl(item.url);
											goto(item.url);
										}}
										class="px-4 py-2 hover:text-[#E5B167] dark:hover:text-[#E5B167] transition-colors whitespace-normal"
									>
										{item.title}
									</DropdownItem>
								{/each}
							</Dropdown>
						</div>
					{:else}
						<NavLi
							class="px-3 py-2 rounded-md cursor-pointer flex items-center h-full"
							on:click={() => {
								updateActiveUrl(page.url + '');
								goto(page.url + '');
							}}
							active={activeUrl === page.url}
							style={activeUrl === page.url ? `color: ${THEME_COLORS.TEXT.ACTIVE};` : 'color: var(--text-light); @media (prefers-color-scheme: dark) { color: var(--text-dark); }'}
						>
							{page.title}
						</NavLi>
					{/if}
				{/each}
			</NavUl>
		</Navbar>
	{/if}

	<main class="flex-1 bg-white dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] transition-colors duration-300">
		<slot />
	</main>
</div>
