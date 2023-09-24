<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllViewersData, AllViewersData } from '../../stores/viewersStore.js';
	import {
		Chart,
		BarController,
		CategoryScale,
		LinearScale,
		BarElement,
		Tooltip,
		Legend
	} from 'chart.js';

	Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

	export let data: any;
	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		fetchChartData();
	});

	//data type
	interface ViewerDataForYear {
		news_viewers: number;
		exhibition_viewers: number;
		suly_expo_viewers: number;
	}

	type YearlyViewerData = {
		[year: string]: ViewerDataForYear;
	};

	// Process and create chart data
	async function fetchChartData() {
		await getAllViewersData(data.supabase);

		const yearData: YearlyViewerData = {};

		$AllViewersData.forEach((item) => {
			const year = new Date(item.created_at ?? '').getFullYear();
			if (!yearData[year]) {
				yearData[year] = {
					news_viewers: 0,
					exhibition_viewers: 0,
					suly_expo_viewers: 0
				};
			}
			yearData[year].news_viewers += item?.news_viewers || 0;
			yearData[year].exhibition_viewers += item.exhibition_viewers || 0;
			yearData[year].suly_expo_viewers += item.suly_expo_viewers || 0;
		});

		const labels = Object.keys(yearData);
		const newsData = labels.map((year) => yearData[year].news_viewers);
		const exhibitionData = labels.map((year) => yearData[year].exhibition_viewers);
		const sulyExpoData = labels.map((year) => yearData[year].suly_expo_viewers);

		const ctx = canvas.getContext('2d');
		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'News Viewers',
						data: newsData,
						backgroundColor: 'rgba(255, 99, 132, 0.2)',
						borderColor: 'rgba(255, 99, 132, 1)',
						borderWidth: 1
					},
					{
						label: 'Exhibition Viewers',
						data: exhibitionData,
						backgroundColor: 'rgba(54, 162, 235, 0.2)',
						borderColor: 'rgba(54, 162, 235, 1)',
						borderWidth: 1
					},
					{
						label: 'Suly Expo Viewers',
						data: sulyExpoData,
						backgroundColor: 'rgba(255, 206, 86, 0.2)',
						borderColor: 'rgba(255, 206, 86, 1)',
						borderWidth: 1
					}
				]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}
</script>

<div class="border dark:border-gray-800 p-10 w-full rounded-lg">
	<canvas bind:this={canvas} />
</div>
