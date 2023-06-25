<script lang="ts">
	import PaginationButton from './PaginationButton.svelte';

	export let currentPage: number;
	export let totalPages: number;
	export let goToPage: any;
</script>

<div class="py-5 flex justify-end items-center">
	<button
		on:click={() => goToPage(currentPage - 1)}
		disabled={currentPage === 1}
		class="border bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-l-md"
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

	<div>
		{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
			<PaginationButton {page} {currentPage} onClick={() => goToPage(page)} />
		{/each}
	</div>

	<button
		on:click={() => goToPage(currentPage + 1)}
		class="border bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-r-md"
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
