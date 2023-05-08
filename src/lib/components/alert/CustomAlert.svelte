<script lang="ts">
	import { Button, Modal } from 'flowbite-svelte';
	import { XCircle } from 'svelte-heros-v2';

	export let type: 'info' | 'success' | 'warning' | 'error' = 'info';
	export let title = 'Error';
	export let message = 'Something went wrong. Please try again later.';
	let popupModal = false;

	const alertClasses: Record<string, string> = {
		info: 'bg-blue-500 text-white',
		success: 'bg-green-500 text-white',
		warning: 'bg-yellow-500 text-white',
		error: 'bg-red-500 text-white'
	};
</script>

<Modal class={`p-4 rounded ${alertClasses[type]}`} open={true} size="xs" autoclose={true}>
	<div class="text-center">
		{#if type == 'error'}
			<!-- error icon inside circle  -->
			<XCircle color="red" size="80" />
		{:else if type == 'success'}
			<svg
				aria-hidden="true"
				class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 13l4 4L19 7"
				/></svg
			>
		{:else if type == 'warning'}
			<svg
				aria-hidden="true"
				class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
		{:else}
			<svg
				aria-hidden="true"
				class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
		{/if}

		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			{title}
		</h3>
		<h5 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			{message}
		</h5>
		<Button color="alternative">Ok</Button>
	</div>
</Modal>
