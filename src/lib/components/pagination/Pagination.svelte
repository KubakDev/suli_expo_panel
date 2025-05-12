<script lang="ts">
	import { THEME_COLORS } from '$lib/utils/themeColors';
	import { IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';
	export let currentPage: number;
	export let totalPages: number;
	export let goToPage: (page: number) => void;
</script>

<div class="flex justify-end items-center px-4 lg:px-0">
	<div class="py-5 flex justify-center items-center gap-2">
		<button
			on:click={() => goToPage(currentPage - 1)}
			disabled={currentPage === 1}
			class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2D3748] hover:bg-gray-100 dark:hover:bg-[#3A4556] cursor-pointer text-gray-600 dark:text-gray-300 py-2 px-2 rounded-md transition duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Previous page"
		>
			<IconChevronLeft size={18} stroke={1.5} />
		</button>
		
		<div class="flex items-center justify-center py-1 px-3 rounded-md bg-white dark:bg-[#2D3748] border border-gray-300 dark:border-gray-600">
			<span class="text-gray-700 dark:text-gray-200 mx-1 font-medium">{currentPage}</span>
			<span class="text-gray-500 dark:text-gray-400 mx-1">of</span>
			<span class="text-gray-700 dark:text-gray-200 mx-1 font-medium">{totalPages}</span>
		</div>
		
		<button
			on:click={() => goToPage(currentPage + 1)}
			disabled={currentPage === totalPages || totalPages === 0}
			class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2D3748] hover:bg-gray-100 dark:hover:bg-[#3A4556] cursor-pointer text-gray-600 dark:text-gray-300 py-2 px-2 rounded-md transition duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Next page"
		>
			<IconChevronRight size={18} stroke={1.5} />
		</button>
	</div>
</div>
