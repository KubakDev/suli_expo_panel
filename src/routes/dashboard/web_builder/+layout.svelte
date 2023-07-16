<script lang="ts">
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let data;

	let isSidebarOpen = true;

	$: activeUrl = '/';
	$: if ($page.url) {
		page.subscribe((value) => {});
		activeUrl = $page.url.pathname;
	}

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	onMount(() => {
		document.body.classList.toggle('overflow-hidden', isSidebarOpen);
	});
</script>

<div class="flex h-full w-full">
	<div>
		<button
			class="fixed right-4 top-4 z-40 bg-pink-800 p-4 mt-16 rounded-full shadow"
			on:click={toggleSidebar}
		>
			<svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6v6m0 0v6m0-6h6m-6 0H6"
				/>
			</svg>
		</button>
		<Sidebar
			class={'z-40 border lg:w-64 xl:w-72 fixed mt-0 left-0 min-h-screen bg-gray-900 transition-transform duration-300 ease-in-out transform translate-x-0 ' +
				(isSidebarOpen ? 'translate-x-0' : '-translate-x-full')}
		>
			<SidebarWrapper class="bg-[#14213d] min-h-screen pt-5 px-5">
				<SidebarGroup class="flex flex-col justify-start ">
					{#each data.sideBarPage as pageData}
						<div class="flex gap-2 items-center">
							<img src={pageData.icon} alt="img" class="" />
							<SidebarItem href={pageData.url} label={pageData.title} class="text-white" />
						</div>
					{/each}
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
	</div>
	<div class="w-full">
		<slot />
	</div>
</div>
