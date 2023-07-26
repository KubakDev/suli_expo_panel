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

<div class="app h-screen flex flex-col" style={getTheme()}>
	{#if !$page.url.pathname.startsWith('/dashboard/seats_ui')}
		<Navbar class="dark:bg-gray-900 bg-gray-900 border-b shadow-lg" let:hidden let:toggle>
			<NavBrand href="/dashboard">
				<div class="flex justify-between items-center gap-5">
					<div class="mr-3 h-6 sm:h-9">
						<span class="self-center whitespace-nowrap text-xl font-semibold text-white">
							SulyExpo</span
						>
					</div>
				</div>
			</NavBrand>

			<DarkMode class="text-xl " />

			<NavHamburger btnClass="ml-3 lg:hidden" on:click={toggle} />
			<NavUl
				{hidden}
				divClass="w-full lg:block lg:w-auto"
				nonActiveClass="text-gray-900 hover:bg-opacity-30 font-medium hover:bg-blue-400 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 transition-all"
				activeClass="text-primary-700 font-medium bg-opacity-30 bg-blue-500 lg:bg-transparent lg:text-primary-700"
				ulClass="flex flex-col p-4 mt-4 lg:flex-row lg:space-x-8 lg:mt-0 lg:text-sm lg:font-medium"
			>
				{#each data.pages as page}
					{#if page.children}
						<div class="text-[#e9ecef] py-4 lg:py-0">
							<button class="flex items-center focus:outline-none focus:ring-0 dark:focus:ring-0">
								<Chevron>{page.title}</Chevron>
							</button>

							<Dropdown class="font-medium ">
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
