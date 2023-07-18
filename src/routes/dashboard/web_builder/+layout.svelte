<script lang="ts">
	import { NavLi, Sidebar, SidebarGroup, SidebarWrapper } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let data;

	$: activeUrl = '/';
	$: if ($page.url) {
		page.subscribe((value) => {});
		activeUrl = $page.url.pathname;
	}

	let isSidebarOpen = true;
	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	window.addEventListener('resize', closeSidebarOnSmallScreen);

	function updateActiveUrl(url: string) {
		activeUrl = url;
		goto('/');
		console.log(activeUrl);
	}

	window.addEventListener('resize', closeSidebarOnSmallScreen);

	function closeSidebarOnSmallScreen() {
		if (window.innerWidth < 768) {
			isSidebarOpen = false;
		}
	}

	window.addEventListener('resize', closeSidebarOnSmallScreen);
</script>

<div class=" w-full">
	<div class="lg:flex">
		<!-- Sidebar Drawer -->
		<div
			class={'sidebar-drawer bg-[#14213d] min-h-screen rounded-none border ' +
				(isSidebarOpen ? 'open' : '')}
		>
			<Sidebar>
				<SidebarWrapper class="bg-[#14213d] min-h-screen">
					<SidebarGroup class="flex flex-col py-5">
						<!-- Sidebar content -->
						{#each data.sideBarPage as pageData}
							<div
								class="flex gap-2 items-center py-1 hover:bg-gray-50 hover:bg-opacity-10 px-2 rounded"
							>
								<img src={pageData.icon} alt="img" class="icon" />
								<NavLi
									class="cursor-pointer text-white"
									on:click={() => {
										updateActiveUrl(pageData.url + '');
										goto(pageData.url + '');
									}}
									active={activeUrl == pageData.url}
									style={activeUrl == pageData.url ? 'color: primary;' : 'color:#e9ecef'}
								>
									{pageData.title}
								</NavLi>
							</div>
						{/each}
					</SidebarGroup>
				</SidebarWrapper>
			</Sidebar>
		</div>

		<!-- Toggle Button -->
		<div>
			<button
				class={'mt-5 h-10 bg-[#14213d] p-4 shadow border flex-shrink-0   rounded lg:hidden block ' +
					(isSidebarOpen ? 'ml-0' : 'ml-auto') +
					' flex items-center justify-center'}
				on:click={toggleSidebar}
			>
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
				>
			</button>
		</div>
		<!-- Main Content -->
		<div class="flex-1">
			<div
				class={'w-full h-full overflow-auto' + (isSidebarOpen ? 'overlay open' : '')}
				on:click={toggleSidebar}
			>
				<slot />
			</div>
		</div>
	</div>
</div>

<style>
	@media (max-width: 768px) {
		.sidebar-drawer {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			width: 100%;
			max-width: 300px; /* Adjust the width as needed */
			transform: translateX(-100%);
			transition: transform 0.3s ease-out;
			z-index: 40;
		}

		.sidebar-drawer.open {
			transform: translateX(0);
		}

		.main-content {
			margin-left: 0;
			transition: margin-left 0.3s ease-out;
		}
	}
</style>
