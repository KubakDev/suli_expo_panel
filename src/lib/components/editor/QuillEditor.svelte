<script lang="ts">
	import { onMount } from 'svelte';
	import 'quill/dist/quill.snow.css';
	import 'katex/dist/katex.min.css';

	export let placeholder: string;
	export let isFormSubmitted: boolean;
	export let langData: any;

	let quill: any;
	let container: any;

	onMount(async () => {
		const Quill = (await import('quill')).default;

		quill = new Quill(container, {
			theme: 'snow',
			modules: {
				toolbar: [
					['bold', 'italic', 'underline', 'strike', 'link'],
					['blockquote', 'code-block'],
					['video', 'formula', 'image'],
					[{ header: 1 }, { header: 2 }],
					[{ list: 'ordered' }, { list: 'bullet' }],
					[{ script: 'sub' }, { script: 'super' }],
					[{ indent: '-1' }, { indent: '+1' }],
					[{ direction: 'rtl' }],
					[{ size: ['small', false, 'large', 'huge'] }],
					[{ header: [1, 2, 3, 4, 5, 6, false] }],
					[{ color: [] }, { background: [] }],
					[{ font: [] }],
					[{ align: [] }],
					['clean']
				],
				formula: true
			},
			placeholder: placeholder
		});

		// Set the initial content of the Quill editor to langData.long_description
		quill.root.innerHTML = langData.long_description;

		// Event listener for text change in Quill editor
		quill.on('text-change', () => {
			langData.long_description = quill.root.innerHTML;
		});
	});
</script>

<div bind:this={container} class="quill-container" />

{#if isFormSubmitted && !langData.long_description.trim()}
	<p class="error-message">Please enter a long description</p>
{/if}

<style>
	.error-message {
		color: red;
	}
	.quill-container {
		border-radius: 0px 0px 10px 10px;
	}
</style>
