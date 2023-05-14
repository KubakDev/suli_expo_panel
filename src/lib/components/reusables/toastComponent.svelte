<!-- App.svelte -->
<script lang="ts">
	import { Toast } from 'flowbite-svelte';
	import toastsData from '../../../stores/toastStore';
	import type { ToastType } from '../../../models/toast';
	import { ToastTypeEnum } from '../../../models/toastTypeEnum';
	import { ExclamationCircle, CheckCircle, InformationCircle, XCircle } from 'svelte-heros-v2';

	let toasts: ToastType[] = [];
	$: {
		toasts = [];
		for (let i = 0; i < $toastsData.length; i++) {
			showToast($toastsData[i]);
		}
	}
	function showToast(message: ToastType) {
		toasts = [...toasts, message];
	}
	function getColor(type: ToastTypeEnum) {
		let color:
			| 'green'
			| 'red'
			| 'form'
			| 'gray'
			| 'yellow'
			| 'indigo'
			| 'default'
			| 'purple'
			| 'pink'
			| 'blue'
			| 'light'
			| 'dark'
			| 'dropdown'
			| 'navbar'
			| 'navbarUl'
			| 'none'
			| undefined;
		switch (type) {
			case ToastTypeEnum.SUCCESS:
				color = 'green';
				break;
			case ToastTypeEnum.ERROR:
				color = 'red';
				break;
			case ToastTypeEnum.WARNING:
				color = 'yellow';
				break;
			case ToastTypeEnum.INFO:
				color = 'blue';
				break;
			default:
				color = 'green';
				break;
		}
		return color;
	}
</script>

<div class="toast-container">
	{#each toasts as toast, index}
		<Toast color={getColor(toast.type)} class={`mb-2 border-2 border-${getColor(toast.type)}-400`}>
			<svelte:fragment slot="icon">
				{#if toast.type === ToastTypeEnum.SUCCESS}
					<CheckCircle class="text-xs h-5 w-5 " />
				{/if}
				{#if toast.type === ToastTypeEnum.WARNING}
					<ExclamationCircle class="text-xs h-5 w-5 " />
				{/if}
				{#if toast.type === ToastTypeEnum.ERROR}
					<XCircle class="text-xs h-5 w-5 " />
				{/if}
				{#if toast.type === ToastTypeEnum.INFO}
					<InformationCircle class="text-xs h-5 w-5 " />
				{/if}
				<span class="sr-only">CheckCircle icon</span>
			</svelte:fragment>
			<h1 class={`text-md font-medium text-${getColor(toast.type)}-800 mb-2`}>{toast.title}</h1>
			<p class="text-xs">{toast.message}</p>
		</Toast>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 10px;
		right: 10px;
	}
</style>
