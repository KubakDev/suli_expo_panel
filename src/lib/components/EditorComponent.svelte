<script lang="ts">
	import Editor from '@tinymce/tinymce-svelte';

	export let langData: any;
	export let isFormSubmitted: boolean;

	const conf = {
		plugins:
			'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
		menubar: 'file edit view insert format tools table help',
		toolbar:
			'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
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
