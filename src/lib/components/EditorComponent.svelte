<script>
	import Editor from '@tinymce/tinymce-svelte';

	export let langData;

	const conf = {
		toolbar:
			'undo redo | a11ycheck casechange blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | ' +
			'bullist numlist checklist outdent indent | removeformat | code table help',
		plugins: [
			'a11ychecker',
			'advlist',
			'advcode',
			'advtable',
			'autolink',
			'checklist',
			'export',
			'lists',
			'link',
			'image',
			'charmap',
			'preview',
			'anchor',
			'searchreplace',
			'visualblocks',
			'powerpaste',
			'fullscreen',
			'formatpainter',
			'insertdatetime',
			'media',
			'table',
			'help',
			'wordcount'
		],
		menubar: 'table',
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
