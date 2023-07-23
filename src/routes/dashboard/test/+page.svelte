<script lang="ts">
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { CardType, ExpoCard } from 'kubak-svelte-component';

	let items = [
		{ id: 0, name: 'item1', position: 1 },
		{ id: 1, name: 'item2', position: 3 },
		{ id: 2, name: 'item3', position: 2 }
	];

	const flipDurationMs = 300;

	function handleDndConsider(e: any) {
		items = e.detail.items;
	}

	function handleDndFinalize(e: any) {
		items = e.detail.items.map((item: any, index: any) => ({
			...item,
			position: index + 1
		}));
		console.log(items);
	}
</script>

<table>
	<thead>
		<tr>
			<th>ID</th>
			<th>Name</th>
		</tr>
	</thead>
	<tbody
		use:dndzone={{ items, flipDurationMs }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each items as item (item.id)}
			<tr animate:flip={{ duration: flipDurationMs }}>
				<td>{item.id}</td>
				<td>{item.name}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
	}

	th,
	td {
		border: 1px solid #ccc;
		padding: 8px;
		text-align: left;
	}

	th {
		background-color: #f0f0f0;
	}

	tbody {
		cursor: grab;
	}

	/* Apply styles for dragging state */
	tr[data-dnd-dragging] {
		background-color: #ddd;
	}

	/* Apply styles for the placeholder during dragging */
	tr.dnd-placeholder {
		background-color: #f0f0f0;
	}
</style>
