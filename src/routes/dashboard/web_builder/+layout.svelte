<script lang="ts">
	import { NavLi, Sidebar, SidebarGroup, SidebarWrapper } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Drawer, CloseButton } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let data;
	let hidden2 = true;

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};
	$: activeUrl = '/';
	$: if ($page.url) {
		page.subscribe((value) => {});
		activeUrl = $page.url.pathname;
	}

	function updateActiveUrl(url: string) {
		activeUrl = url;
		goto('/');
	}
</script>

<div class=" w-full">
	<div class="lg:flex">
		<!-- sidebar for mobile devices -->
		<div class="lg:hidden block">
			<div class="flex justify-end">
				<button class="bg-primary-50 p-4 shadow-lg border" on:click={() => (hidden2 = false)}>
					<svg
						width="20px"
						height="20px"
						viewBox="0 -0.5 17 17"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						class="si-glyph si-glyph-jump-page-left-right"
						fill="#ffffff"
						stroke="#ffffff"
						><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						/><g id="SVGRepo_iconCarrier">
							<title>659</title> <defs />
							<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
								<g transform="translate(1.000000, 0.000000)" fill="#ffffff">
									<path
										d="M5.958,8.951 L5.958,7.007 L3.979,7.007 L3.97900001,5.06677246 C3.97900001,4.57762889 0.265,7.332 0.265,7.332 C-0.095,7.696 -0.095,8.29 0.264,8.655 C0.264,8.655 3.97900001,11.4734899 3.97900001,10.9475709 L3.979,8.951 L5.958,8.951 Z"
										class="si-glyph-fill"
									/>
									<path
										d="M10.002,7 L10.002,8.973 L12.048,8.973 L12.048,11 C12.048,11.4553833 15.695,8.684 15.695,8.684 C16.055,8.336 16.055,7.771 15.695,7.423 C15.695,7.423 11.980774,4.64377734 11.980774,5.03546143 L12.048,7 L10.002,7 Z"
										class="si-glyph-fill"
									/> <rect x="7" y="0" width="2" height="16" class="si-glyph-fill" />
								</g>
							</g>
						</g></svg
					></button
				>
			</div>
			<Drawer
				divClass="bg-gray-900 z-[100]"
				transitionType="fly"
				{transitionParams}
				bind:hidden={hidden2}
				id="sidebar2"
			>
				<div class="flex items-center">
					<CloseButton on:click={() => (hidden2 = true)} class="mb-4 dark:text-white" />
				</div>
				<Sidebar>
					<SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-900  ">
						<SidebarGroup>
							<h1 class="text-gray-200 text-xl font-semibold pb-3 flex justify-center">
								Page Builder
							</h1>
							<div class="border border-gray-400 border-opacity-60" />

							{#each data.sideBarPage as pageData}
								<button
									on:click={() => {
										updateActiveUrl(pageData.url + '');
										goto(pageData.url + '');
									}}
									class="flex flex-col text-white py-3 hover:bg-gray-50 hover:bg-opacity-10 px-4 rounded"
								>
									<div class="flex items-center gap-4 text-xl">
										<img src={pageData.icon} alt="img" class="icon object-cover" />

										{pageData.title}
									</div>
								</button>
							{/each}
						</SidebarGroup>
					</SidebarWrapper>
				</Sidebar>
			</Drawer>
		</div>

		<!-- Sidebar for desktop  -->
		<div class="sidebar-drawer bg-gray-900 min-h-screen rounded-none border lg:block hidden">
			<Sidebar>
				<SidebarWrapper divClass="bg-gray-900 min-h-screen px-4">
					<SidebarGroup class="flex flex-col py-5">
						<h1 class="text-gray-200 text-xl font-semibold pb-3 text-center">Page Builder</h1>
						<div class="border border-gray-700 border-opacity-60" />
						<!-- Sidebar content -->

						{#each data.sideBarPage as pageData}
							<button
								on:click={() => {
									updateActiveUrl(pageData.url + '');
									goto(pageData.url + '');
								}}
								class=" flex gap-4 items-center py-3 hover:bg-gray-50 hover:bg-opacity-10 px-2 rounded"
							>
								<img src={pageData.icon} alt="img" class="icon" />
								<NavLi
									class="cursor-pointer text-white text-lg"
									active={activeUrl == pageData.url}
									style={activeUrl == pageData.url ? 'color:E1B168' : 'color:white'}
								>
									{pageData.title}
								</NavLi>
							</button>
						{/each}
					</SidebarGroup>
				</SidebarWrapper>
			</Sidebar>
		</div>

		<!-- Main Content -->
		<div class="flex-1">
			<div class="w-full h-full overflow-auto">
				<slot />
			</div>
		</div>
	</div>
</div>
