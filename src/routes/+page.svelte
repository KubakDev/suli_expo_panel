<script lang="ts">
	import Editor from '@tinymce/tinymce-svelte';
	import ToastComponent from '$lib/components/reusables/toastComponent.svelte';
	import { Button } from 'flowbite-svelte';
	import { addNewToast } from '../stores/toastStore';
	let conf = {
		toolbar: 'undo redo',
		menubar: true
	};
	let value = 'some content';
	let test = ['test', 'test2', 'test3', 'test4', 'test5'];
	function showToast(message: string) {
		test = [...test, message];
	}
</script>

<!-- <Button on:click={() => addNewToast()}>Show Toast 1</Button> -->
<ToastComponent />
