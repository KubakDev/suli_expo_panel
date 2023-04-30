<script lang="ts">
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	// import '../styles.scss';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	// import BsTrash from 'svelte-icons-pack/bs/BsTrash';
	// import Icon from 'svelte-icons-pack';

	export let data: PageData;

	let spanClass = 'flex-1 ml-3 whitespace-nowrap';
	$: activeUrl = '/';
	let IconComponent: any = null;
	$: if ($page.url) {
		page.subscribe((value) => {});
		activeUrl = $page.url.pathname;
	}
	async function loadIcon(iconUrl: string) {
		// let iconImport = await import(`${iconUrl}`);
		// const { default: icon } = iconImport;
		// IconComponent = icon;
	}
	// loadIcon('svelte-icons-pack/bs/BsTrash');
</script>

<div class=" flex h-full w-full text-white">
	<div class="">
		<Sidebar>
			<SidebarWrapper style="min-height: calc(100vh - 75px);">
				<SidebarGroup>
					{#each data.sideBarPage as pageData}
						<SidebarItem href={pageData.url} label={pageData.title}>
							<svelte:fragment slot="icon">
								{#if IconComponent !== null}
									<!-- {loadIcon('').then((icon) => {
									})} -->
									<!-- <Icon src={IconComponent} size="1.2rem" className="text-danger" /> -->
								{/if}
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
