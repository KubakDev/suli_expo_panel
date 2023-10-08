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

	function updateActiveUrl(url: string) {
		activeUrl = url;
	}
</script>

<div class="app h-screen flex flex-col" style={getTheme()}>
	{#if !$page.url.pathname.startsWith('/dashboard/seats_ui')}
		<Navbar class="dark:bg-gray-900 bg-gray-900 border-b shadow-lg" let:hidden let:toggle>
			<NavBrand href="/dashboard">
				<span
					class="self-center whitespace-nowrap text-xl font-semibold text-gray-50 dark:text-white"
					>SulyExpo</span
				>
			</NavBrand>
			<div class="flex items-center md:order-2">
				<DarkMode class="text-xl mr-4" />
				<form action="/?/signout" method="POST">
					<button type="submit" class="flex items-center mr-4 text-gray-300 hover:text-gray-100">
						<span class="inline-flex items-center gap-2">
							Logout
							<svg
								class="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/></svg
							>
						</span>
					</button>
				</form>

				<NavHamburger on:click={toggle} />
			</div>

			<NavUl
				{hidden}
				divClass="w-full lg:block lg:w-auto"
				nonActiveClass="text-gray-900 hover:bg-gray-50 hover:bg-opacity-10 font-medium  lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 transition-all"
				activeClass="text-primary-700 font-medium bg-gray-50 bg-opacity-10 lg:bg-transparent lg:text-primary-700"
				ulClass="flex flex-col p-4 mt-4 lg:flex-row lg:space-x-8 lg:mt-0 lg:text-sm lg:font-medium dark:bg-gray-900 bg-gray-900 "
				class="order-1"
			>
				{#each data.pages as page}
					{#if page.children}
						<div class="text-[#e9ecef] pl-4 md:pl-0 py-4 lg:py-0">
							<button class="flex items-center focus:outline-none focus:ring-0 dark:focus:ring-0">
								<Chevron>{page.title}</Chevron>
							</button>

							<Dropdown class="font-medium">
								{#each page.children as item}
									<DropdownItem
										on:click={() => {
											updateActiveUrl(item.url);
											goto(item.url);
										}}>{item.title}</DropdownItem
									>
								{/each}
							</Dropdown>
						</div>
					{:else}
						<NavLi
							class="cursor-pointer"
							on:click={() => {
								updateActiveUrl(page.url + '');
								goto(page.url + '');
							}}
							active={activeUrl == page.url}
							style={activeUrl == page.url ? '' : 'color:#e9ecef'}>{page.title}</NavLi
						>
					{/if}
				{/each}
			</NavUl>
		</Navbar>
	{/if}
	<div class="flex-1 justify-center dark:bg-gray-900 dark:text-white">
		<slot />
	</div>
</div>
