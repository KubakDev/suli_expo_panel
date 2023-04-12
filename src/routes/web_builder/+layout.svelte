<script lang="ts">
	import {
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
		Button,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		SidebarDropdownItem,
		SidebarDropdownWrapper
	} from 'flowbite-svelte';
	import '../styles.scss';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: PageData;

	let spanClass = 'flex-1 ml-3 whitespace-nowrap';
	$: activeUrl = '/';

	$: if ($page.url) {
		page.subscribe((value) => {
			console.log(value);
		});
		console.log(data);
		console.log($page.url);
		activeUrl = $page.url.pathname;
	}
</script>

<div class="flex h-full w-full">
	<div class="flex items-center">
		<Sidebar>
			<SidebarWrapper style="min-height: calc(100vh - 75px);">
				<SidebarGroup>
					{#each data.sideBarPage as pageData}
						<SidebarItem href={pageData.url}  label={pageData.title}>
							<svelte:fragment slot="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
									/><path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
									/></svg
								>
							</svelte:fragment>
						</SidebarItem>
					{/each}
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
	</div>
	<div class=" w-full">
		<slot />
	</div>
</div>
