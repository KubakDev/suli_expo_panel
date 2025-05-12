<script lang="ts">
	import { THEME_COLORS } from '$lib/utils/themeColors';
	export let insertData: () => void;
</script>

<div class="py-5 px-4 lg:px-0 flex justify-end">
	<button
		on:click={insertData}
		class="bg-[#e9ecefd2] dark:bg-[#323a45] dark:hover:bg-[#2c3440] flex text-black dark:text-gray-200 gap-2 p-2 rounded-md shadow-md border border-gray-300 dark:border-gray-700 transition-colors"
	>
		<svg
			width="20px"
			height="20px"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0" />

			<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

			<g id="SVGRepo_iconCarrier">
				<path
					fill="#6b6b6b"
					fill-rule="evenodd"
					d="M9 17a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3a1 1 0 10-2 0v6H3a1 1 0 000 2h6v6z"
				/>
			</g>
		</svg>
	</button>
</div>
