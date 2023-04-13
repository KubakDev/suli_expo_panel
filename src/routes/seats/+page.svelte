<script>
	import {
		Button,
		Modal,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import SeatGround from './seat.svelte';
	import news from '../../stores/news';
	import CreateNews from '$lib/components/news/createNews.svelte';
	import { newsCollection, showDeleteModal, paginationData } from '../../stores/news';
	// import BsTrash from 'svelte-icons-pack/bs/BsTrash';
	// import FiEdit from 'svelte-icons-pack/fi/FiEdit';
	import loading from '../../stores/loading';
	import Pagination from '$lib/components/reusables/pagination.svelte';
</script>

<div class="w-full bg-white" style="min-height: calc(100vh - 300px);">
	<!-- <Sidebar>
		<SidebarWrapper style="min-height: calc(100vh - 75px);">
			<SidebarGroup>
				<SidebarItem  label={'ss'}>
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
	</Sidebar> -->
	<SeatGround />
</div>
