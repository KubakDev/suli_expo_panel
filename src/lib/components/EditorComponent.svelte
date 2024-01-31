<script lang="ts">
	import Editor from '@tinymce/tinymce-svelte';

	export let langData: any;
	export let isFormSubmitted: boolean;

	const conf = {
		plugins:
			'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
		toolbar:
			'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
		height: 500
	};
</script>

<Editor
	apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
	channel="5-dev"
	text="readonly-text-output"
	bind:value={langData.long_description}
	{...conf}
/>

{#if isFormSubmitted && !langData.long_description.trim()}
	<p class="error-message">Please enter a long description</p>
{/if}

<!-- {#if !langData.long_description.trim()}
	<p class="error-message">Please enter a long description</p>
{/if} -->

<style>
	.error-message {
		color: red;
	}
</style>
