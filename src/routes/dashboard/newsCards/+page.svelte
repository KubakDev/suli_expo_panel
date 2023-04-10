<script lang="ts">
	let Card: any;
	import { supabase } from '../../../supabase';
	let cardData = {
		title: 'The Story',
		description:
			'Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content, makinlook like readable English. Many desktop publishing packages.',
		date: '16 Nov 2023'
	};
	async function getUI() {
		const response: any = await supabase.from('design').select();
		console.log(response);
		const module = await import('kubak-svelte-component');
		Card = module[response.data[0].post_card_type];
	}
	const loadMainCard = async () => {};
	import { onMount } from 'svelte';

	onMount(async () => {
		await getUI();
		loadMainCard();
	});
</script>

{#if Card}
	<div class="flex flex-col items-center justify-center w-full">
		<h1 class="font-light text-gray-700 lg:mb-16 sm:text-xl dark:text-gray-400">current card</h1>
		<Card data={cardData} />
	</div>
{:else}
	<div>Loading...</div>
{/if}
