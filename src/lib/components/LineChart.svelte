<script lang="ts">
 import { Icon } from 'flowbite-svelte-icons';
 import { onMount } from 'svelte';
 import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';
 import type { PageData } from '../../routes/$types';
 import { Button, Input, Label, Select } from 'flowbite-svelte';
 import { THEME_COLORS } from '$lib/utils/themeColors';
	import { IconFilter, IconFilterCancel } from '@tabler/icons-svelte';
 
 Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip);

 let chart: any = null;
 let canvas: any = null;
 let labels: string[] = [];
 let dataOfReservation: number[] = [];
 let startDate: string = '';
 let endDate: string = '';
 let exhibitions: { id: number; exhibition_type: string }[] = [];  
 let selectedExhibitionId: number | null = null;  
 export let data: PageData;

 interface ReservationData {
   exhibition_name: string;
   reservation_count: number;
 }

 // Fetch exhibition data
 async function fetchExhibitions(): Promise<void> {
   const { data: exhibitionData, error } = await data.supabase.
   from('exhibition').
   select('id, exhibition_type')
    .is('deleted_status', null); 

   if (error) {
     console.error(error);
   } else {
     exhibitions = exhibitionData;
   }
 }

 async function fetchReservationData(filterByDate = false): Promise<void> {
   let formattedStartDate = filterByDate && startDate ? convertDateToMDY(startDate) : null;
   let formattedEndDate = filterByDate && endDate ? convertDateToMDY(endDate) : null;

   const { data: reservationData, error } = await data.supabase.rpc('get_reservation_data', {
     p_start_date: formattedStartDate,
     p_end_date: formattedEndDate,
     p_exhibition_id: selectedExhibitionId 
   });

   if (error) {
     console.error(error);
   } else {
     labels = reservationData.map((entry: ReservationData) => entry.exhibition_name);
     dataOfReservation = reservationData.map((entry: ReservationData) => entry.reservation_count);
     renderChart();
   }
 }

 function convertDateToMDY(date: string): string {
   const [year, month, day] = date.split('-'); // Use '-' as the delimiter for `input type="date"`
   return `${month}/${day}/${year}`; // Return date in m/d/Y format
 }

 const isDarkTheme = localStorage.getItem("theme") === "dark";  

 const chartColors = {
   borderColor: isDarkTheme ? 'lightblue' : 'blue',
   backgroundColor: isDarkTheme ? 'rgba(173, 216, 230, 0.1)' : 'rgba(0, 0, 255, 0.1)',
   gridColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
   textColor: isDarkTheme ? '#FFFFFF' : '#000000'
 };

 function renderChart() {
   if (chart) {
     chart.destroy();
   }

   const pointStyle = dataOfReservation.length > 1 ? 'circle' : 'rectRot';  

   chart = new Chart(canvas, {
     type: 'line',
     data: {
       labels: labels,
       datasets: [{
         label: 'Number of Reservations',
         data: dataOfReservation,
         borderColor: chartColors.borderColor,
         backgroundColor: chartColors.backgroundColor,
         fill: true,
         tension: 0.4,
         pointStyle: pointStyle, 
         pointRadius: 8,  
       }]
     },
     options: {
       responsive: true,
       plugins: {
         title: {
           display: true,
          },
         tooltip: {
           mode: 'index',
           intersect: false,
         },
       },
       scales: {
         x: {
           title: {
             display: true,
             text: 'Exhibition',
           },
         },
         y: {
           title: {
             display: true,
             text: 'Number of Reservations',
           },
           beginAtZero: true,
         },
       },
     },
   });
 }

 function clearFilters(): void {
   startDate = '';
   endDate = '';
   selectedExhibitionId = null; // Reset exhibition filter
   fetchReservationData();
 }

 onMount((): void => {
   fetchExhibitions();
   fetchReservationData();
 });
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  <div class="flex justify-between items-center relative">
    <!-- Date Pickers and Exhibition Filter for Filtering -->
    <h1 class="text-color font-bold text-xl mx-4 text-gray-600 dark:text-gray-300">Weekly Reservation Data</h1>
    <div class="flex gap-2 items-end mb-4">
      <div>
        <Label for="start-date" class="block mb-1 text-color text-gray-600 dark:text-gray-300">Start Date</Label>
        <Input 
            class="w-full"
            type="date" 
            id="start-date" 
            bind:value={startDate} 
        />
      </div>
      <div>
        <Label for="end-date" class="block mb-1 text-color text-gray-600 dark:text-gray-300">End Date</Label>
        <Input 
            class="w-full"
            type="date" 
            id="end-date" 
            bind:value={endDate} 
        />
      </div>
      <div>
        <Label for="exhibition" class="block mb-1 text-color text-gray-600 dark:text-gray-300">Exhibition</Label>
        <Select
            id="exhibition"
            class="w-full"
            bind:value={selectedExhibitionId}
        >
            <option value={null}>Select Exhibition</option>
            {#each exhibitions as exhibition}
                <option value={exhibition.id}>{exhibition.exhibition_type}</option>
            {/each}
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <button
        class="w-11 h-11 flex items-center justify-center 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
        on:click={() => fetchReservationData(true)}>
          <IconFilter size={24} class="dark:text-gray-200 text-gray-600" />
        </button>

        <button
        class="w-11 h-11 flex items-center justify-center 
					bg-gray-200 hover:bg-gray-300 text-gray-900 
					dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 
					border border-gray-300 dark:border-gray-600 
					rounded"
        on:click={clearFilters}>
          <IconFilterCancel size={24} class="text-red-500" />
        </button>
      </div>
    </div>
  </div>
  
  <!-- Full Width Chart Section -->
  <div class="border dark:border-gray-700 p-10 w-full rounded-lg bg-white dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
    <canvas bind:this={canvas}></canvas>
  </div>
</div>

<style>
  canvas {
    width: 100%;
    height: auto; 
  }
  
</style>
