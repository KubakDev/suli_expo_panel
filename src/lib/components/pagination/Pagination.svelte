<script lang="ts">
	export let currentPage: number;
	export let totalPages: number;
	export let goToPage: (page: number) => void;
</script>

<div class="flex justify-end items-center px-4 lg:px-0">

	<div class="py-5 flex justify-center items-center">
		<button
			on:click={() => goToPage(currentPage - 1)}
			disabled={currentPage === 1}
			class="border border-gray-300 bg-white dark:bg-[#e9ecefd2] hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-black py-2 px-4 rounded-l-md transition duration-200 ease-in-out"
		>
			<div>
				<svg
					width="20px"
					height="20px"
					viewBox="0 0 1024 1024"
					class="icon"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					fill="#65686c"
				>
					<g id="SVGRepo_bgCarrier" stroke-width="0" />
					<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
					<g id="SVGRepo_iconCarrier">
						<path
							d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
							fill="#65686c"
						/>
					</g>
				</svg>
			</div>
		</button>
		<div class="flex items-center justify-center">
			<span class="text-gray-700 mx-2 font-semibold">{currentPage} </span> of
			<span class="text-gray-400 mx-2 font-semibold"> {totalPages}</span>
		</div>
		<button
			on:click={() => goToPage(currentPage + 1)}
			class="border border-gray-300 bg-white dark:bg-[#e9ecefd2] hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-black py-2 px-4 rounded-r-md transition duration-200 ease-in-out"
			disabled={currentPage == totalPages}
		>
			<div>
				<svg
					width="20px"
					height="20px"
					viewBox="0 0 1024 1024"
					class="icon"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					fill="#000000"
				>
					<g id="SVGRepo_bgCarrier" stroke-width="0" />
					<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
					<g id="SVGRepo_iconCarrier">
						<path
							d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
							fill="#65686c"
						/>
					</g>
				</svg>
			</div>
		</button>
	</div>
</div>
