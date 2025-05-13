<script lang="ts">
	import { onMount } from 'svelte';
	import { getViewerData, viewerData } from '../../stores/viewersStore.js';
	//@ts-ignore
	import BarChart from '$lib/components/BarChart.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import { IconListDetails, IconPhoto, IconNews } from '@tabler/icons-svelte';
	import { Input, Label } from 'flowbite-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;
	let isDataLoaded = false;
	let selectedDate: Date;

	async function fetchData() {
		await getViewerData(data.supabase, 1, undefined);
		isDataLoaded = true;
	}
	onMount(fetchData);

	// This will be a string formatted as 'YYYY-MM-DD'

	async function handleDateChange() {
		await getViewerData(data.supabase, 1, selectedDate);
	}

	function formatDate(dateString: any) {
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
</script>

{#if isDataLoaded}
	<div class="max-w-screen-2xl mx-auto py-10">
		<!-- filter by depend month  -->
		<div class="flex justify-end px-4">
			<div class="w-60">
				<Label>
					<Input
						type="date"
						name="date_filter"
						class="w-full"
						 bind:value={selectedDate}
						on:change={handleDateChange}
					/>
				</Label>
			</div>
		</div>

		<!-- card header -->
		<div class="flex flex-col flex-auto flex-shrink-0 antialiased text-black dark:text-white">
			<div class="h-full mb-10">
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4 gap-4">
					<div
						class="bg-[#ff6384]/10 border shadow-lg rounded-md flex items-center justify-between p-3 border-b-4 border-[#ff6384] dark:border-[#ff6384] dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] dark:text-white text-gray-900 font-medium group"
					>
						<div
							class="flex justify-center items-center w-24 h-24 bg-[#ff6384] rounded-full transition-all duration-300 transform group-hover:rotate-12"
						>
							<IconNews class="w-16 h-16" />
						</div>
						<div class="text-right">
							<p class="text-5xl pb-5">
								{$viewerData?.news_viewers || 0}
								<!-- <Countup
									initial={0}
									value={$viewerData?.news_viewers}
									duration={2000}
									step={1}
									roundto={1}
									format={true}
								/> -->
							</p>
							<p>News Viewer</p>
							<span class="text-gray-500 text-xs">{formatDate($viewerData?.created_at)}</span>
						</div>
					</div>
					<div
						class="bg-[#36a2eb]/10 border shadow-lg rounded-md flex items-center justify-between p-3 border-b-4 border-[#36a2eb] dark:border-[#36a2eb] dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] dark:text-white text-gray-900 font-medium group"
					>
						<div
							class="flex justify-center items-center w-24 h-24 bg-[#36a2eb] rounded-full transition-all duration-300 transform group-hover:rotate-12"
						>
							<IconPhoto class="w-16 h-16" />
						</div>
						<div class="text-right">
							<p class="text-5xl pb-5">
								{$viewerData?.exhibition_viewers || 0}
								<!-- <Countup
									initial={0}
									value={$viewerData?.exhibition_viewers}
									duration={2000}
									step={1}
									roundto={1}
									format={true}
								/> -->
							</p>
							<p>Exhibition Viewer</p>
							<span class="text-gray-500 text-xs">{formatDate($viewerData?.created_at)}</span>
						</div>
					</div>
					<div
						class="bg-[#ffce56]/10 border shadow-lg rounded-md flex items-center justify-between p-3 border-b-4 border-[#ffce56] dark:border-[#ffce56] dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] dark:text-white text-gray-900 font-medium group"
					>
						<div
							class="flex justify-center items-center w-24 h-24 bg-[#ffce56] rounded-full transition-all duration-300 transform group-hover:rotate-12"
						>
							<IconListDetails class="w-16 h-16" />
						</div>
						<div class="text-right">
							<p class="text-5xl pb-5">
								{$viewerData?.suly_expo_viewers || 0}
								<!-- <Countup
									initial={0}
									value={$viewerData?.suly_expo_viewers}
									duration={2000}
									step={1}
									roundto={1}
									format={true}
								/> -->
							</p>
							<p>SulyExpo Viewer</p>
							<span class="text-gray-500 text-xs">{formatDate($viewerData?.created_at)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
									
		<h1 class="text-color font-bold text-xl mx-4 text-gray-600 dark:text-gray-300">Yearly Visitor Data</h1>
   
		<!-- chart js -->
		<div class="px-4 mt-6"><BarChart {data} /></div>
	</div>
{/if}
{#if isDataLoaded}
  <div>
    {#if data}
      <LineChart data={data} />
    {/if}
  </div>
{/if}
