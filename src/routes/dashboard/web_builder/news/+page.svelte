<script lang="ts">
	import {
		Sidebar,
		SidebarGroup,
		SidebarWrapper,
		SidebarDropdownWrapper,
		Button,
		Spinner,
		Label
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { supabase } from '../../../../supabase';
	import { DefaultSectionHeader } from 'kubak-svelte-component';
	import DynamicImage from '$lib/components/reusables/dynamicImage.svelte';
	import colorTheme from '../../../../stores/colorTheme';
	import type { ColorTheme } from '../../../../models/colorTheme';

	export let data;
	let currentRowId: number;
	let CardComponent: any;
	let loading = false;
	$: component = CardComponent;
	let selectedCard: string = 'MainCard';
	let selectedColorTheme = $colorTheme[0];
	let colors = [
		'primaryColor',
		'secondaryColor',
		'onPrimaryColor',
		'onSecondaryColor',
		'backgroundColor',
		'onBackgroundColor'
	];
	let showCustomColor: boolean = false;
	let customColors: ColorTheme = {} as ColorTheme;

	const enum CardType {
		Home = 'home',
		News = 'news'
	}
	async function getUI() {
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
			.eq('page', CardType.News);
		selectedColorTheme = response.data[0].color_palette;
		const cardIndex = response.data.findIndex((item: any) => item.component_type.type === 'card');
		currentRowId = response.data[cardIndex].id;
		let card = response.data[cardIndex].component.title;
		const module = await import('kubak-svelte-component');
		CardComponent = module[card];
	}
	onMount(async () => {
		await getUI();
		component = CardComponent;
	});
	async function changeCardType(cardType: any) {
		//change cardType to pascalCase
		cardType = cardType.charAt(0).toUpperCase() + cardType.slice(1);
		selectedCard = cardType;
		const module = await import('kubak-svelte-component');
		CardComponent = module[cardType];
	}
	async function publish() {
		loading = true;
		let newColorPaletteId = 0;
		if (Object.keys(customColors).length > 0) {
			const newColorData = await supabase
				.from('color_palette')
				.insert([
					{
						name: 'test',
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
		const { data } = await supabase
			.from('component')
			.select('id')
			.eq('title', selectedCard)
			.single();
		const response = await supabase
			.from('page_builder')
			.update({
				componentId: data?.id,
				color_palette: newColorPaletteId
			})
			.eq('id', 2);
		loading = false;
	}
	let allCards: string[] = [];
	const images = import.meta.glob('$lib/images/cards/*.{jpg,jpeg,png,gif}');
	Object.keys(images).forEach((key) => {
		const fileName: string = key.split('/').pop()!;
		// Do something with the file name
		allCards.push(fileName.split('.').shift()!);
	});
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
				<!-- <DefaultSectionHeader title="NEWS" /> -->
				<h1
					style={`color:${
						Object.keys(customColors).length > 0
							? customColors.onBackgroundColor
							: selectedColorTheme.onBackgroundColor
					}`}
					class="text-lg font-bold"
				>
					NEWS
				</h1>
			</div>
			<div class="grid grid-cols-3">
				{#each data.news as news}
					<div class="p-10">
						{#if component}
							<svelte:component
								this={component}
								data={news}
								colors={Object.keys(customColors).length > 0 ? customColors : selectedColorTheme}
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
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
								/></svg
							>
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
										<!-- <img src={MainCardImg} alt="image" class="h-24 w-24" /> -->
										<DynamicImage
											src="../../src/lib/images/cards/{card}.png"
											className={`w-[80px] h-[80px]`}
										/>
										<p>{card}</p>
									</div>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
								{/each}
							</div>
						</div>
					</SidebarDropdownWrapper>
					<SidebarDropdownWrapper label="Colors">
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
									d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
								/></svg
							>
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
											<p class="text-sm">{color.name}</p>
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
