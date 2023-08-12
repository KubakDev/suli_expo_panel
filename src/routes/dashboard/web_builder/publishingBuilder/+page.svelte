<script lang="ts">
	import { onMount } from 'svelte';
	import { getComponentData } from '../../../../stores/componentStor';
	import { pageTheme, updatePageData } from '../../../../stores/pageStore';
	import type { ColorTheme } from '../../../../models/colorTheme';
	import type { PageData } from '../../../..//models/pageType';
	import { PageEnum } from '../../../../models/pageEnum';
	import SidebarPage from '$lib/components/webBuilder/SidebarPage.svelte';
	import PageContent from '$lib/components/webBuilder/PageContent.svelte';
	import { setColor } from '../../../../stores/setColorStore';

	export let data;
	let showToast = false;
	let componentData: any = [];

	let selectedColorTheme = {
		id: 0,
		name: '',
		primaryColor: '',
		secondaryColor: '',
		overlayPrimaryColor: '',
		overlaySecondaryColor: '',
		backgroundColor: '',
		overlayBackgroundColor: ''
	};

	let pageBuilder: PageData = {
		id: 0,
		componentId: 0,
		componentTypeId: 0,
		page: '',
		color_palette_id: 0
	};

	let cardShape: any = null;

	let customColors: ColorTheme = {
		name: '',
		primaryColor: '',
		secondaryColor: '',
		overlayPrimaryColor: '',
		overlaySecondaryColor: '',
		backgroundColor: '',
		overlayBackgroundColor: '',
		active: null
	};

	// get component data
	let supabase = data.supabase;
	async function fetchComponentData() {
		let data = await getComponentData(supabase);
		componentData = data;
	}

	onMount(fetchComponentData);

	function changeCardType(cardType: any) {
		cardShape = cardType;
		//
	}

	function changePageTheme(colorTheme: any) {
		selectedColorTheme = colorTheme;
		customColors = {};
		//
	}

	async function getPageData() {
		const result = await data.supabase
			.from('page_builder')
			.select('*,color_palette(*),component_type(*),component(*)')
			.eq('page', PageEnum.PUBLISHING)
			.single();

		if (result) {
			pageBuilder = {
				id: result.data?.id,
				componentId: result.data?.componentId,
				componentTypeId: result.data?.componentTypeId,
				page: PageEnum.PUBLISHING,
				color_palette_id: result.data?.color_palette_id
			};

			customColors = {
				name: result.data?.name,
				primaryColor: result.data?.color_palette?.primaryColor,
				secondaryColor: result.data?.color_palette?.secondaryColor,
				overlayPrimaryColor: result.data?.color_palette?.overlayPrimaryColor,
				overlaySecondaryColor: result.data?.color_palette?.overlaySecondaryColor,
				backgroundColor: result.data?.color_palette?.backgroundColor,
				overlayBackgroundColor: result.data?.color_palette?.overlayBackgroundColor
			};

			cardShape = result.data?.component_type?.type;

			pageBuilder = { ...pageBuilder };
			customColors = { ...customColors };

			// Update the pageTheme store with the fetched data
			pageTheme.set([pageBuilder]);
		}
	}

	onMount(getPageData);

	async function update() {
		showToast = true;
		const componentID = componentData.find((item: any) => item.type === cardShape)?.id || null;
		pageBuilder.color_palette_id = selectedColorTheme?.id || pageBuilder.color_palette_id;
		pageBuilder.componentTypeId = componentID;
		//
		await updatePageData(pageBuilder, data.supabase);

		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	setColor.subscribe((value) => {
		//
		//
		customColors.backgroundColor = value?.backgroundColor || customColors?.backgroundColor;
		customColors.overlayBackgroundColor =
			value?.overlayBackgroundColor || customColors?.overlayBackgroundColor;
		customColors.overlayPrimaryColor =
			value?.overlayPrimaryColor || customColors?.overlayPrimaryColor;
		customColors.overlaySecondaryColor =
			value?.overlaySecondaryColor || customColors?.overlaySecondaryColor;
		customColors.primaryColor = value?.primaryColor || customColors?.primaryColor;
		customColors.secondaryColor = value?.secondaryColor || customColors?.secondaryColor;
	});
</script>

{#if showToast}
	<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
		The Update Was Successfully!
	</div>
{/if}

<div class="flex justify-between min-h-screen">
	<!-- page content -->
	<div class="w-full">
		<PageContent {customColors} {selectedColorTheme} {cardShape} title="publishing" />
	</div>

	<div class="h-full rounded-md flex flex-col items-center justify-between py-5">
		<SidebarPage
			{changeCardType}
			{selectedColorTheme}
			{update}
			{changePageTheme}
			{customColors}
			{data}
		/>
	</div>
</div>
