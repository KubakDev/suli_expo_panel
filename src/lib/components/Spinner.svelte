<script lang="ts">
	export let size: string = 'h-16 w-16';  
	export let color: string = 'border-gray-500';  
</script>

<div class="flex justify-center items-center h-screen">
	<div class={`animate-spin rounded-full ${size} border-t-4 border-b-4 ${color}`}></div>
</div>

<style>
	.animate-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>