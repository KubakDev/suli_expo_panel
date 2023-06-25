<script lang="ts">
	import {
		Sidebar,
		SidebarGroup,
		SidebarWrapper,
		SidebarDropdownWrapper,
		Button,
		Spinner,
		Label,
		Input
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import DynamicImage from '$lib/components/reusables/dynamicImage.svelte';
	import colorTheme, { getAllThemes } from '../../../../stores/colorTheme';
	import type { ColorTheme } from '../../../../models/colorTheme';
	import { supabaseStore } from '../../../../stores/supabaseStore';
	import { addNewToast } from '../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../models/toastTypeEnum';
	import { getNews } from '../../../../stores/news';
	import type { News } from '../../../../models/news';
	import { ImgSourceEnum } from '../../../../models/imgSourceEnum';
	import { CardType } from '../../../../models/cardTypeEnum';
	import { service } from '../../../../stores/serviceStore';

	export let data;
	onMount(async () => {
		await getAllThemes();
	});
	let currentRowId: number;
	let CardComponent: any;
	let loading = false;
	$: component = CardComponent;
	let selectedCard: string = 'MainCard';
	let selectedColorTheme = $colorTheme[0];
	let allCards: string[] = [];
	let colors = [
		'primaryColor',
		'secondaryColor',
		'onPrimaryColor',
		'onSecondaryColor',
		'backgroundColor',
		'onBackgroundColor'
	];
	type customColorType = {
		[key: string]: string;
	};
	let showCustomColor: boolean = false;
	let customColors: customColorType = {} as customColorType;
	let allNews: News[] = [];

	async function getUI() {
		const supabase = $supabaseStore;
		if (!supabase) return;
		const response: any = await supabase
			.from('page_builder')
			.select(
				`
					id,
			component_type:componentTypeId(
				id,
					type
				),
				component:componentId(
					title
				),
				color_palette:color_palette(
				*
		  )
			`
			)
			.eq('page', CardType.Service);
		selectedColorTheme = response.data[0].color_palette;
		const cardIndex = response.data.findIndex((item: any) => item.component_type.type === 'card');
		currentRowId = response.data[cardIndex].id;
		let card = response.data[cardIndex].component.title;
		const module = await import('kubak-svelte-component');
		CardComponent = module[card as keyof typeof module];
	}
	async function getAllNews() {
		const response = await data.supabase.from('news').select(
			`*,
			news_languages(*)
			`
		);
		allNews = response.data as News[];
	}
	onMount(async () => {
		// await getAllServices(data.supabase);
		await getUI();
		await getNews(0, 10, data.supabase);
		await getAllNews();
		component = CardComponent;
		const images = import.meta.glob('../../../../../static/images/cards/*.{jpg,jpeg,png,gif}');
		Object.keys(images).forEach((key) => {
			const fileName: string = key.split('/').pop()!;
			allCards.push(fileName.split('.').shift()!);
		});
	});
	async function changeCardType(cardType: any) {
		cardType = cardType.charAt(0).toUpperCase() + cardType.slice(1);
		selectedCard = cardType;
		const module = await import('kubak-svelte-component');
		CardComponent = module[cardType as keyof typeof module];
	}
	async function publish() {
		loading = true;
		let newColorPaletteId = 0;
		if (Object.keys(customColors).length > 0) {
			const newColorData = await $supabaseStore!
				.from('color_palette')
				.insert([
					{
						name: customColors.name,
						primaryColor: customColors.primaryColor,
						secondaryColor: customColors.secondaryColor,
						onPrimaryColor: customColors.onPrimaryColor,
						onSecondaryColor: customColors.onSecondaryColor,
						backgroundColor: customColors.backgroundColor,
						onBackgroundColor: customColors.onBackgroundColor
					}
				])
				.select();
			newColorPaletteId = newColorData?.data![0].id;
		}
		const { data } = await $supabaseStore!
			.from('component')
			.select('id')
			.eq('title', selectedCard)
			.single();
		const response = await $supabaseStore!
			.from('page_builder')
			.update({
				componentId: data?.id,
				color_palette:
					Object.keys(customColors).length > 0 ? newColorPaletteId : selectedColorTheme?.id
			})
			.eq('id', 2);
		if (response.error) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'an error occured while publishing the page',
				title: 'Error'
			});
		} else {
			addNewToast({
				type: ToastTypeEnum.SUCCESS,
				message: 'page published successfully',
				title: 'Success'
			});
		}
		loading = false;
	}

	function changeColorTheme(colorTheme: any) {
		selectedColorTheme = colorTheme;
	}
</script>

<div class="flex justify-between">
	<div class="w-full p-10">
		<div
			style={`min-height: 1100px;width:100%;background-color:${
				Object.keys(customColors).length > 0
					? customColors.backgroundColor
					: selectedColorTheme?.backgroundColor
			}`}
		>
			<div class=" flex justify-center pt-8">
				<h1
					style={`color:${
						Object.keys(customColors).length > 0
							? customColors.onBackgroundColor
							: selectedColorTheme?.onBackgroundColor
					}`}
					class="text-lg font-bold"
				>
					NEWS
				</h1>
			</div>
			<div class="flex flex-wrap justify-center">
				{#each $service as newsItem}
					<div class="p-10 w-[600px]">
						{#if component}
							<svelte:component
								this={component}
								data={newsItem.service_languages[0]}
								colors={Object.keys(customColors).length > 0 ? customColors : selectedColorTheme}
								imageData={{
									thumbnail: newsItem.thumbnail,
									imgSource: ImgSourceEnum.remote
								}}
							/>
						{:else}
							<div />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div
		class="h-full bg-[#f9fafb] rounded-md flex flex-col items-center justify-between py-5"
		style="height: calc(100vh - 80px)"
	>
		<Sidebar style="width:300px" class="h">
			<SidebarWrapper>
				<SidebarGroup>
					<SidebarDropdownWrapper label="Cards">
						<svelte:fragment slot="icon">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M21 8.25C21 7.5 20.25 6.75 19.5 6.75H4.5C3.75 6.75 3 7.5 3 8.25V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V8.25ZM4.5 2.25C2.84315 2.25 1.5 3.59315 1.5 5.25V18.75C1.5 20.4069 2.84315 21.75 4.5 21.75H19.5C21.1569 21.75 22.5 20.4069 22.5 18.75V5.25C22.5 3.59315 21.1569 2.25 19.5 2.25H4.5Z"
									fill="#373737"
								/>
							</svg>
						</svelte:fragment>
						<svelte:fragment slot="arrowup">
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
									d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
						</svelte:fragment>
						<svelte:fragment slot="arrowdown">
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
									d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
						</svelte:fragment>
						<div style="height: auto; width: 100%;">
							<div class="grid grid-cols-2">
								{#each allCards as card}
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<div
										class=" my-2 cursor-pointer h-32 w-32 py-1 bg-backgroundComponent rounded-md flex flex-col items-center justify-between"
										on:click={() => changeCardType(card)}
									>
										<DynamicImage src="/images/cards/{card}.png" className={`w-[80px] h-[80px]`} />
										<p class="text-black">{card}</p>
									</div>
								{/each}
							</div>
						</div>
					</SidebarDropdownWrapper>
					<SidebarDropdownWrapper label="Colors">
						<svelte:fragment slot="icon">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M20.4235 15.5625C20.3438 15.4734 20.2735 15.3937 20.2219 15.3328C20.0625 15.1453 19.8422 15.0281 19.5985 15.0047C19.35 14.9812 19.1063 15.0516 18.9141 15.2109C18.8672 15.2484 18.825 15.2906 18.7875 15.3375C18.7313 15.4031 18.6563 15.4875 18.5672 15.5859C17.8453 16.3922 16.5 17.9016 16.5 19.4625C16.5 21.1406 17.8453 22.5047 19.5 22.5047C21.1547 22.5047 22.5 21.1406 22.5 19.4625C22.5 17.8875 21.15 16.3734 20.4235 15.5625ZM19.5 21C18.675 21 18 20.3062 18 19.4578C18 18.5672 18.9188 17.4516 19.5047 16.7859C20.0906 17.4516 21 18.5672 21 19.4578C21 20.3062 20.325 21 19.5 21Z"
									fill="#373737"
								/>
								<path
									d="M17.911 14.7703H17.925C18.2063 14.7703 18.4734 14.6625 18.6703 14.4609C18.8719 14.2594 18.9797 13.9969 18.9797 13.7156C18.9797 13.4344 18.8672 13.1578 18.6656 12.9609L7.82345 2.20781C6.87658 1.25625 5.3297 1.25156 4.37814 2.20312L4.13439 2.44687C3.18283 3.39375 3.17814 4.94062 4.1297 5.89219L6.0797 7.84219L2.10939 11.8078C1.72033 12.1969 1.5047 12.7125 1.50001 13.2656C1.49533 13.8187 1.71095 14.3344 2.10001 14.7234C2.10939 14.7328 2.11876 14.7422 2.13283 14.7562L8.28283 20.6625C8.68595 21.0469 9.19689 21.2391 9.71251 21.2391C10.2281 21.2391 10.7485 21.0422 11.1469 20.6578L11.8078 20.0203C13.7625 18.1312 16.7063 15.2812 17.0906 14.8969C17.1141 14.8734 17.3063 14.7703 17.911 14.7703ZM5.18908 4.8375C4.82345 4.46719 4.82345 3.87656 5.18908 3.51094L5.43283 3.26719C5.79845 2.90156 6.39376 2.90156 6.75939 3.27187L8.71408 5.2125L7.13439 6.79219L5.18908 4.8375ZM16.036 13.8234C15.6891 14.1703 12.6094 17.1516 10.7672 18.9375L10.1063 19.575C9.88595 19.7859 9.54376 19.7859 9.32345 19.5797L3.17345 13.6734L3.16408 13.6641C3.05626 13.5562 3.00001 13.4156 3.00001 13.2656C3.00001 13.1156 3.06095 12.975 3.16876 12.8672L7.13908 8.90625L9.78283 6.2625L16.9406 13.3641C16.5563 13.4531 16.2563 13.6031 16.036 13.8234Z"
									fill="#373737"
								/>
							</svg>
						</svelte:fragment>
						<svelte:fragment slot="arrowup">
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
									d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
						</svelte:fragment>
						<svelte:fragment slot="arrowdown">
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
									d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
						</svelte:fragment>
						<div style="height: auto; width: 100%;">
							<div class="grid grid-cols-3">
								{#if !showCustomColor}
									{#each $colorTheme as color}
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<div
											class=" my-2 cursor-pointer h-24 w-20 py-1 bg-backgroundComponent rounded-md flex flex-col items-center justify-between"
											on:click={() => changeColorTheme(color)}
										>
											<div class="h-14 w-14" style={`background-color:${color?.primaryColor}`} />
											<p class="text-sm text-black">{color.name}</p>
										</div>
									{/each}
								{/if}
							</div>
							<div class="py-5 text-center">
								<Button
									on:click={() => {
										if (showCustomColor) customColors = {};
										showCustomColor = !showCustomColor;
									}}>{showCustomColor ? 'Cancel' : 'Create new Palette'}</Button
								>
							</div>
							{#if showCustomColor}
								<div class="flex items-center justify-between py-2">
									<Input
										id="default-input"
										placeholder="theme name"
										bind:value={customColors.name}
									/>
								</div>
								<div class="h-96 w-full bg-backgroundComponent py-5">
									{#if selectedColorTheme}
										{#each colors as color}
											<div class="flex items-center justify-between px-10 py-2">
												<Label for="brand" class="mb-2">{color}</Label>
												<input
													type="color"
													id="head"
													name="head"
													bind:value={customColors[color]}
												/>
											</div>
										{/each}
									{/if}
								</div>
							{/if}
						</div>
					</SidebarDropdownWrapper>
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
		<div>
			<Button class="w-52" on:click={() => publish()}>
				{#if loading}
					<Spinner class="mr-3" size="4" />
				{/if}
				Publish</Button
			>
		</div>
	</div>
</div>
