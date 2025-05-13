<script lang="ts">
	import { THEME_COLORS } from '$lib/utils/themeColors';
	import { IconPlus } from '@tabler/icons-svelte';
	export let insertData: () => void;
</script>

<div class="py-5 px-4 lg:px-0 flex justify-end">
	<button
		on:click={insertData}
		class="bg-[#e9ecefd2] dark:bg-[#323a45] dark:hover:bg-[#2c3440] flex text-black dark:text-gray-200 gap-2 p-2 rounded-md shadow-md border border-gray-300 dark:border-gray-700 transition-colors"
	>
	<IconPlus size={20} />
	</button>
</div>
