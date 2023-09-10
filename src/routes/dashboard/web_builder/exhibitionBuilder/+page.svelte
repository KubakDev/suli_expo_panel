<script lang="ts">
	import { onMount } from 'svelte';
	import { getPageData, selectedTheme } from '../../../../stores/pageStore';
	import { PageEnum } from '../../../../models/pageEnum';
	import SidebarPage from '$lib/components/webBuilder/SidebarPage.svelte';
	import PageContent from '$lib/components/webBuilder/PageContent.svelte';
	import { pageTheme } from '../../../../stores/pageStore';
	export let data;

	let openLightCard = true;

	async function fetchPageData() {
		await getPageData(PageEnum.EXHIBITION, data.supabase);
		//
	}
	onMount(fetchPageData);

	// create toggle for changing swapping between page theme color
	function toggleMode() {
		openLightCard = !openLightCard;

		if ($selectedTheme.mode_type === 'dark') {
			selectedTheme.set($pageTheme.color_palette_light);
		} else {
			selectedTheme.set($pageTheme.color_palette_dark);
		}
	}
</script>

<div class="flex justify-between min-h-screen">
	<!-- page content -->
	<div class="w-full">
		<PageContent title="EXHIBITION" {toggleMode} />
	</div>

	<!-- right-sideBar -->
	<div class="h-full rounded-md flex flex-col items-center justify-between py-5">
		<SidebarPage {data} {openLightCard} />
	</div>
</div>
