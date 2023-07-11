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
		<Navbar style="background-color: #14213d;" let:hidden let:toggle>
			<NavBrand href="/">
				<div class="mr-3 h-6 sm:h-9">
					<span class="self-center whitespace-nowrap text-xl font-semibold text-white">
						SuliExpo
					</span>
				</div>
			</NavBrand>
			<NavHamburger on:click={toggle} />
			<NavUl {hidden} class="bg-[#14213d] ">
				{#each data.pages as page}
					{#if page.children}
						<div class="text-[#e9ecef] py-4 lg:py-0">
							<button class="flex items-center focus:outline-none focus:ring-0 dark:focus:ring-0">
								<Chevron>{page.title}</Chevron>
							</button>

							<Dropdown>
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
							style={activeUrl == page.url ? 'color: primary;' : 'color:#e9ecef'}
							>{page.title}</NavLi
						>
					{/if}
				{/each}
			</NavUl>
		</Navbar>
	{/if}
	<div class="flex-1 justify-center">
		<slot />
	</div>
</div>
