<script lang="ts">
	import Editor from '@tinymce/tinymce-svelte';

	let conf = {
		toolbar: 'undo redo',
		menubar: true
	};
	let value = 'some content';

	$: {
		console.log(value);
	}
</script>

<!-- <Editor apiKey="z8xd7vu4qjwgky2gsars9d6ym05l8k665i0cf0d8iiiaeuwr" bind:value={value}/> -->
<Editor
	apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
	channel="5"
	text="readonly-text-output"
	cssClass="tinymce-wrapper"
	bind:value
/>
<h1>homee</h1>
