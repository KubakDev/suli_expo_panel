<script lang="ts">
	import { onMount } from 'svelte';
	import { getPageData } from '../../../../stores/pageStore';
	import { PageEnum } from '../../../../models/pageEnum';
	import SidebarPage from '$lib/components/webBuilder/SidebarPage.svelte';
	import PageContent from '$lib/components/webBuilder/PageContent.svelte';

	export let data;

	async function fetchPageData() {
		await getPageData(PageEnum.EXHIBITION, data.supabase);
	}
	onMount(fetchPageData);
</script>

<div class="flex justify-between min-h-screen">
	<!-- page content -->
	<div class="w-full">
		<PageContent title="exhibition" />
	</div>

	<!-- right-sideBar -->
	<div class="h-full rounded-md flex flex-col items-center justify-between py-5">
		<SidebarPage {data} />
	</div>
</div>
