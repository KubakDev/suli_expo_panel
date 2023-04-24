<script lang="ts">
	import {
		Sidebar,
		SidebarGroup,
		SidebarWrapper,
		SidebarDropdownWrapper,
		Button,
		Spinner
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { supabase } from '../../../../supabase';
	import { DefaultNavigationHeader, DefaultSectionHeader } from 'kubak-svelte-component';
	import DynamicImage from '$lib/components/reusables/dynamicImage.svelte';
	import { FlatCard } from 'kubak-svelte-component';
	export let data;
	console.log(data.news);
	let currentRowId: number;
	let CardComponent: any;
	let loading = false;
	$: component = CardComponent;
	let selectedCard: string = 'MainCard';
	const enum CardType {
		Home = 'home',
		News = 'news'
	}
	async function getUI() {
		const response: any = await supabase
			.from('page_builder')
			.select(
				`
		component_type:componentTypeId(
				type
			),
			component:componentId(
				title
			)
		`
			)
			.eq('page', CardType.News);
		console.log(response);
		const cardIndex = response.data.findIndex((item: any) => item.component_type.type === 'card');
		console.log(cardIndex);
		currentRowId = response.data[cardIndex].id;
		let card: 'HorizontalCard' | 'MainCard' = response.data[cardIndex].component.title;

		// const module = await import('kubak-svelte-component');
		// CardComponent = module[card];
		console.log(CardComponent);
	}
	onMount(async () => {
		await getUI();
		console.log('news ui news ui');
		component = CardComponent;
	});
	async function changeCardType(cardType: any) {
		console.log(cardType);
		//change cardType to pascalCase
		cardType = cardType.charAt(0).toUpperCase() + cardType.slice(1);
		selectedCard = cardType;
		const module = await import('kubak-svelte-component');
		// CardComponent = module[cardType];
		console.log(CardComponent);
	}
	async function publish() {
		loading = true;
		const { data } = await supabase
			.from('component')
			.select('id')
			.eq('title', selectedCard)
			.single();
		console.log(data, selectedCard, currentRowId);
		const response = await supabase
			.from('page_builder')
			.update({
				componentId: data?.id
			})
			.eq('id', 2);
		console.log(response);
		loading = false;
	}
	let allCards: string[] = [];
	const images = import.meta.glob('$lib/images/cards/*.{jpg,jpeg,png,gif}');
	Object.keys(images).forEach((key) => {
		const fileName: string = key.split('/').pop()!;
		// Do something with the file name
		console.log(fileName.split('.').shift());
		allCards.push(fileName.split('.').shift()!);
	});
</script>

<div class="flex justify-between">
	<div class="w-full p-10">
		<div class=" bg-[#747577]" style="min-height: 1100px;width:100%;">
			<!-- <DefaultNavigationHeader /> -->
			<div class=" flex justify-center pt-8">
				<DefaultSectionHeader title="NEWS" />
			</div>
			<div class="grid grid-cols-3">
				{#each data.news as news}
					<div class="p-10">
						{#if component}
							<svelte:component this={component} data={news} />
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
										class=" my-2 cursor-pointer h-32 w-32 py-1 bg-[#f2f3f7] rounded-md flex flex-col items-center justify-center"
										on:click={() => changeCardType(card)}
									>
										<!-- <img src={MainCardImg} alt="image" class="h-24 w-24" /> -->
										<DynamicImage
											src="../../src/lib/images/cards/{card}.png"
											className={`w-[${10}px] h-[${10}px]`}
										/>
										<p>{card}</p>
									</div>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
								{/each}
							</div>
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
