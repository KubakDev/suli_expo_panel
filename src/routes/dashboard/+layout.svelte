<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
		Dropdown,
		DropdownItem,
		DropdownDivider,
		Button,
		Chevron
	} from 'flowbite-svelte';

	import '../styles.scss';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { FeDropShadowElement } from 'canvg';
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
		<Navbar style="background-color: #14213d;" let:hidden let:toggle>
			<NavBrand href="/">
				<div class="mr-3 h-6 sm:h-9">
					<span class="self-center whitespace-nowrap text-xl font-semibold text-white">
						SuliExpo
					</span>
				</div>
			</NavBrand>
			<NavHamburger on:click={toggle} />
			<NavUl {hidden} class="bg-[#14213d] lg:flex lg:items-center lg:justify-center">
				<!-- Add 'flex items-center' class -->
				{#each data.pages as page}
					{#if page.children}
						<Button
							class="bg-primary-dark focus:outline-none focus:ring-0 dark:focus:ring-0 hover:bg-primary-50"
						>
							<Chevron>{page.title}</Chevron>
						</Button>

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
					{:else}
						<NavLi
							class="cursor-pointer text-white hover:text-gray-400"
							on:click={() => {
								updateActiveUrl(page.url);
								goto(page.url);
							}}
							active={activeUrl == page.url}
							style={activeUrl == page.url ? 'color: #c27803;' : 'color:white'}>{page.title}</NavLi
						>
					{/if}
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
