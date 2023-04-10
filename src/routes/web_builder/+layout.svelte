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
	let spanClass = 'flex-1 ml-3 whitespace-nowrap';
	$: activeUrl = '/';
</script>

<div class="flex h-full w-full">
	<div class="flex items-center">
		<Sidebar>
			<SidebarWrapper style="min-height: calc(100vh - 75px);">
				<SidebarGroup>
					<SidebarItem label="News">
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
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
	</div>
	<div class=" w-full">
		<slot />
	</div>
</div>
