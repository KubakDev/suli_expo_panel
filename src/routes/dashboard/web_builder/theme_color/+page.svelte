<script lang="ts">
	import { newsCollection } from '../../../../stores/news';
	import {
		Label,
		Input,
		Button,
		Modal,
		Textarea,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Spinner
	} from 'flowbite-svelte';
	import type { ColorTheme } from '../../../../models/colorTheme';

	export let data;

	let colorThemes: ColorTheme[] = [];
	let loading = false;
	getAllThemes();
	async function getAllThemes() {
		// await supabase
		// 	.from('color_palette')
		// 	.select('*')
		// 	.then((res) => {
		// 		colorThemes = res.data as ColorTheme[];
		// 	});
	}
	const handleSubmit = async () => {
		for (let color of colors) {
			newColorPallet[color.name] = color.value;
		}
		// await supabase
		// 	.from('color_palette')
		// 	.insert(newColorPallet)
		// 	.then((res) => {});
		getAllThemes();
		showModal = false;
	};
	let showModal = false;
	let newColorPallet = {
		name: '',
		primaryColor: '',
		secondaryColor: '',
		foregroundColor: ''
	};
	let colors: { name: 'primaryColor' | 'foregroundColor' | 'secondaryColor'; value: string }[] = [
		{
			name: 'primaryColor',
			value: ''
		},
		{
			name: 'secondaryColor',
			value: ''
		},
		{
			name: 'foregroundColor',
			value: ''
		}
	];
</script>

<div class="text-black h-full flex justify-center">
	<div class="w-3/4 mt-20">
		<div class="py-10 flex justify-end">
			<Button on:click={() => (showModal = true)}>add</Button>
		</div>
		<Table>
			<TableHead>
				<TableHeadCell>Title</TableHeadCell>
				<TableHeadCell>primary color</TableHeadCell>
				<TableHeadCell>secondary color</TableHeadCell>
				<TableHeadCell>foreground color</TableHeadCell>
				<TableHeadCell>
					<span class="sr-only"> Edit </span>
				</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each colorThemes as item}
					<TableBodyRow>
						<TableBodyCell>
							{item.name}
						</TableBodyCell>
						<TableBodyCell>
							<input type="color" id="head" name="head" bind:value={item.primaryColor} disabled />
						</TableBodyCell>
						<TableBodyCell
							><input
								type="color"
								id="head"
								name="head"
								bind:value={item.secondaryColor}
								disabled
							/></TableBodyCell
						>

						<TableBodyCell>
							<div class="flex">
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<div
									class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
								>
									<!-- <Icon src={FiEdit} size="1.2rem" className="text-info" /> -->
								</div>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<div
									class="rounded-md w-10 h-10 flex justify-center items-center hover:bg-hoverBox cursor-pointer"
								>
									<!-- <Icon src={BsTrash} size="1.2rem" className="text-danger" /> -->
								</div>
							</div>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<Modal bind:open={showModal} size="lg" backdropClose={false}>
		<form on:submit={handleSubmit}>
			<div class="bg-[#f9fafb] px-32 py-10 mt-10">
				<h1 class="pb-10 text-xl font-medium">add Color Theme</h1>
				<div>
					<Label for="name" class="mb-2">Name</Label>
					<Input type="text" id="name" placeholder="theme name" bind:value={newColorPallet.name} />
				</div>
				<div class="mt-10 grid gap-9 mb-4 sm:grid-cols-5">
					{#each colors as color}
						<div class="flex flex-col items-center">
							<Label for="brand" class="mb-2">{color.name}</Label>
							<input type="color" id="head" name="head" bind:value={color.value} />
						</div>
					{/each}
				</div>
				<div class="text-end pt-10">
					<Button type="submit" class="w-52 ">
						{#if loading}
							<Spinner class="mr-3" size="4" />
						{:else}
							<svg
								class="mr-1 -ml-1 w-6 h-6"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
								><path
									fill-rule="evenodd"
									d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
									clip-rule="evenodd"
								/></svg
							>
						{/if}

						Add new theme
					</Button>
				</div>
			</div>
		</form>
	</Modal>
</div>
