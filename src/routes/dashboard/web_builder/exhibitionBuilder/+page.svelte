<script lang="ts">
	import { onMount } from 'svelte';
	import { insertData, getData, theme } from '../../../../stores/colorTheme';
	import { getComponentData } from '../../../../stores/componentStor';
	import { pageTheme, updatePageData } from '../../../../stores/pageStore';
	import { ExpoCard, CardType } from 'kubak-svelte-component';
	import type { ColorTheme } from '../../../../models/colorTheme';
	import { addNewToast } from '../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../models/toastTypeEnum';
	import type { PageData } from '../../../..//models/pageType';
	import { PageEnum } from '../../../../models/pageEnum';
	//@ts-ignore
	import { isLength, isEmpty } from 'validator';
	import SidebarPage from '$lib/components/webBuilder/SidebarPage.svelte';
	import PageContent from '$lib/components/webBuilder/PageContent.svelte';

	export let data;
	let showToast = false;
	let componentData: any = [];

	let loading = false;

	let selectedColorTheme = {
		id: 0,
		name: '',
		primaryColor: '',
		secondaryColor: '',
		onPrimaryColor: '',
		onSecondaryColor: '',
		backgroundColor: '',
		onBackgroundColor: ''
	};

	let pageBuilder: PageData = {
		id: 0,
		componentId: 0,
		componentTypeId: 0,
		page: '',
		color_palette_id: 0
	};

	let cardShape: any = null;

	let colors = [
		'primaryColor',
		'secondaryColor',
		'onPrimaryColor',
		'onSecondaryColor',
		'backgroundColor',
		'onBackgroundColor'
	];

	let showCustomColor: boolean = false;

	let customColors: ColorTheme = {
		name: '',
		primaryColor: '',
		secondaryColor: '',
		onPrimaryColor: '',
		onSecondaryColor: '',
		backgroundColor: '',
		onBackgroundColor: '',
		active: null
	};

	// get color_palette data
	async function fetchData() {
		let result = await getData(data.supabase);
		// console.log('????', result);
	}
	onMount(fetchData);

	//insert new color_palette
	async function formSubmit() {
		loading = true;

		// Validate the name field
		if (typeof customColors.name !== 'string' || isEmpty(customColors.name.trim())) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Name field cannot be empty',
				title: 'Error',
				duration: 1000
			});
			loading = false;
			return;
		}

		await insertData(customColors, data.supabase);
		fetchData();
		showCustomColor = !showCustomColor;
		addNewToast({
			type: ToastTypeEnum.SUCCESS,
			message: 'New theme has been created successfully',
			title: 'Success',
			duration: 1000
		});
		loading = false;
	}

	let cards = [
		{
			id: 0,
			cardName: 'flat',
			value: CardType.Flat,
			imgUrl: '../../../../images/cards/flat.png'
		},

		{
			id: 1,
			cardName: 'main',
			value: CardType.Main,
			imgUrl: '../../../../images/cards/main.png'
		},
		{
			id: 2,
			cardName: 'simple',
			value: CardType.Simple,
			imgUrl: '../../../../images/cards/simple.png'
		},
		{
			id: 3,
			cardName: 'square',
			value: CardType.Square,
			imgUrl: '../../../../images/cards/square.png'
		},
		{
			id: 4,
			cardName: 'video',
			value: CardType.Video,
			imgUrl: '../../../../images/cards/video.png'
		}
	];

	// get component data
	let supabase = data.supabase;
	async function fetchComponentData() {
		let data = await getComponentData(supabase);
		componentData = data;
	}

	onMount(fetchComponentData);

	function changeCardType(cardType: any) {
		cardShape = cardType;
		// console.log(cardShape);
	}

	function changePageTheme(colorTheme: any) {
		selectedColorTheme = colorTheme;
		customColors = {};
		// console.log('??????????? selected color theme', selectedColorTheme);
	}

	async function getPageData() {
		const result = await data.supabase
			.from('page_builder')
			.select('*,color_palette(*),component_type(*),component(*)')
			.eq('page', PageEnum.EXHIBITION)
			.single();

		if (result) {
			pageBuilder = {
				id: result.data?.id,
				componentId: result.data?.componentId,
				componentTypeId: result.data?.componentTypeId,
				page: PageEnum.EXHIBITION,
				color_palette_id: result.data?.color_palette_id
			};

			customColors = {
				name: result.data?.name,
				primaryColor: result.data?.color_palette?.primaryColor,
				secondaryColor: result.data?.color_palette?.secondaryColor,
				onPrimaryColor: result.data?.color_palette?.onPrimaryColor,
				onSecondaryColor: result.data?.color_palette?.onSecondaryColor,
				backgroundColor: result.data?.color_palette?.backgroundColor,
				onBackgroundColor: result.data?.color_palette?.onBackgroundColor
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
		pageBuilder.color_palette_id = selectedColorTheme?.id;
		pageBuilder.componentTypeId = componentID;
		await updatePageData(pageBuilder, data.supabase);

		setTimeout(() => {
			showToast = false;
		}, 1000);
	}
</script>

{#if showToast}
	<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
		The Update Was Successfully!
	</div>
{/if}

<div class="flex justify-between min-h-screen">
	<!-- page content -->
	<div class="w-full">
		<PageContent {customColors} {selectedColorTheme} {cardShape} title="Exhibition" />
	</div>

	<div class="h-full bg-[#f9fafb] rounded-md flex flex-col items-center justify-between py-5">
		<SidebarPage
			{changeCardType}
			{cards}
			{showCustomColor}
			{formSubmit}
			{selectedColorTheme}
			{colors}
			{update}
			{changePageTheme}
			{theme}
			{customColors}
		/>
	</div>
</div>
