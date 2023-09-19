<script lang="ts">
	export let insertData: any;
</script>

<div class="py-5 px-4 lg:px-0 flex justify-end">
	<button
		on:click={insertData}
		class="bg-[#e9ecefd2] dark:bg-[#e9ecefd2] dark:hover:bg-gray-100 flex text-black gap-2 p-2 rounded-sm shadow-md border"
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
