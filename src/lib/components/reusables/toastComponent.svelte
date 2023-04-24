<script>
	import { Toast } from 'flowbite-svelte';
</script>

<!-- <div class="toast"> -->
<Toast>
	<span class="font-semibold text-gray-900 dark:text-white">New notification</span>
	<div class="flex items-center mt-3" slot="extra">
		<div class="ml-3">
			<h4 class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</h4>
			<div class="text-sm font-normal">commented on your photo</div>
			<span class="text-xs font-medium text-blue-600 dark:text-blue-500">a few seconds ago</span>
		</div>
	</div>
</Toast>

<!-- </div> -->

<style lang="scss">
	.toast {
		position: fixed;
		right: 20px;
		top: 20px;
		margin: 10px;
	}
</style>
