<script lang="ts">
	import { Label, Input, Modal, Select } from 'flowbite-svelte';
	import {
		insertData,
		updateData,
		theme,
		getData,
		deleteData
	} from '../../../../stores/colorTheme';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import DeleteModal from '$lib/components/DeleteModal.svelte';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import { ModeTypeEnum, type ColorTheme } from '../../../../models/colorTheme';
	import { IconPlus, IconApps, IconTrash, IconGridDots } from '@tabler/icons-svelte';

	export let data;
	let isFormSubmitted = false;
	let showModal = false;
	let submitted = false;

	let colorData: ColorTheme[] = [];

	let newColorPallet: ColorTheme = {
		name: '',
		primaryColor: '',
		secondaryColor: '',
		overlayPrimaryColor: '',
		overlaySecondaryColor: '',
		backgroundColor: '',
		overlayBackgroundColor: '',
		active: null,
		mode_type: ModeTypeEnum.LIGHT
	};

	async function fetchData() {
		let result = await getData(data.supabase);

		colorData = result;
	}

	onMount(fetchData);

	async function formSubmit() {
		let isValidVideoObject = false;

		if (
			!isEmpty(newColorPallet.name) &&
			!isEmpty(newColorPallet.primaryColor) &&
			!isEmpty(newColorPallet.secondaryColor) &&
			!isEmpty(newColorPallet.overlayPrimaryColor) &&
			!isEmpty(newColorPallet.overlaySecondaryColor) &&
			!isEmpty(newColorPallet.backgroundColor) &&
			!isEmpty(newColorPallet.overlayBackgroundColor)
		) {
			isValidVideoObject = true;
		}

		if (!isValidVideoObject) {
			isFormSubmitted = true;
			return;
		}
		newColorPallet.active = null;
		insertData(newColorPallet, data.supabase);

		showModal = false;

		resetForm();

		goto('/dashboard/web_builder/buildThemeColor');
		await fetchData();
	}

	function resetForm() {
		submitted = false;

		newColorPallet = {
			name: '',
			primaryColor: '',
			secondaryColor: '',
			overlayPrimaryColor: '',
			overlaySecondaryColor: '',
			backgroundColor: '',
			overlayBackgroundColor: '',
			active: null,
			mode_type: ModeTypeEnum.LIGHT
		};
	}

	async function toggleChanged(item: any) {
		const updatedThemes = $theme.map((themeItem) => {
			if (themeItem.mode_type === item.mode_type) {
				return { ...themeItem, active: null };
			}
			return themeItem;
		});
		let index = updatedThemes.findIndex((x) => x.id === item.id);
		updatedThemes[index].active = true;

		theme.set(updatedThemes);

		await updateData(updatedThemes[index], data.supabase);
	}

	// delete data
	async function handleDelete(newsId: number) {
		try {
			await deleteData(newsId, data.supabase);
			await fetchData();
		} catch (error) {
			//
		}
	}
</script>

<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
	<div class="py-5 px-4 lg:px-0 flex justify-end">
		<button
			on:click={() => (showModal = true)}
			class="bg-[#e9ecefd2] dark:bg-[#e9ecefd2] dark:hover:bg-gray-100 flex text-black gap-2 p-2 rounded-sm shadow-md border"
		>
			<IconPlus size={20} />
		</button>
	</div>

	<div class="overflow-x-auto rounded">
		<div class="min-w-full table-responsive">
			<table class="min-w-full border-collapse dark:border-gray-700">
				<thead>
					<tr>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell w-10">
							<div class="flex justify-center items-center gap-2">
								<span>NO</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>NAME OF THEME</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>PRIMARY COLOR</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>SECONDARY COLOR</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>OVERLAY PRIMARY COLOR</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>OVERLAY SECONDARY COLOR</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>BACKGROUND COLOR</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>OVERLAY BACKGROUND COLOR</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex justify-center items-center gap-2">
								<span>MODE TYPE</span>
							</div>
						</th>
						<th class="p-3 font-semibold uppercase bg-[#e9ecefd2] dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-700 table-cell">
							<div class="flex items-center gap-2">
								<IconGridDots size={20} class="text-gray-600 dark:text-gray-300" />
								<span>ACTIONS</span>
							</div>
						</th>
					</tr>
				</thead>

				<tbody>
					{#each $theme as item, index (item.id)}
						<tr>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center text-gray-700 dark:text-gray-300 font-semibold">
									{index + 1}
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center">
									<p class="w-20 p-2 rounded dark:text-white font-sans">
										{item.name}
									</p>
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center">
									<div class="w-20 p-2 rounded text-white" style="background: {item.primaryColor};">
										{item.primaryColor}
									</div>
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center">
									<div class="w-20 p-2 rounded text-white" style="background: {item.secondaryColor};">
										{item.secondaryColor}
									</div>
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center">
									<div class="w-20 p-2 rounded text-white" style="background: {item.overlayPrimaryColor};">
										{item.overlayPrimaryColor}
									</div>
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center">
									<div class="w-20 p-2 rounded text-white" style="background: {item.overlaySecondaryColor};">
										{item.overlaySecondaryColor}
									</div>
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center">
									<div class="w-20 p-2 rounded text-white" style="background: {item.backgroundColor};">
										{item.backgroundColor}
									</div>
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell">
								<div class="flex justify-center">
									<div class="w-20 p-2 rounded text-white" style="background: {item.overlayBackgroundColor};">
										{item.overlayBackgroundColor}
									</div>
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell text-gray-600 dark:text-gray-300">
								<div class="flex justify-center">
									{item.mode_type}
								</div>
							</td>
							<td class="p-3 bg-gray-10 dark:bg-[#1f2937] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 table-cell w-32">
								<div class="flex justify-center items-center gap-2">
									<label class="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={item.active}
											on:change={() => toggleChanged(item)}
											class="sr-only peer"
										/>
										<div class="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
									</label>
									<DeleteModal itemIdToDelete={item.id} {handleDelete} />
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- create Modal for adding data  -->
	<div class="text-black h-full flex justify-center">
		<Modal bind:open={showModal} size="lg" backdropClose={false}>
			<form>
				<div class="  px-10 py-10">
					<h1 class="text-xl font-medium">Create a new theme color</h1>
					<div class="py-3 flex items-center gap-2">
						<div>
							<Input
								type="text"
								id="name"
								placeholder="Theme name"
								bind:value={newColorPallet.name}
							/>
							{#if isFormSubmitted && !newColorPallet?.name?.trim()}
								<p class="error-message">Require</p>
							{/if}
						</div>

						<div>
							<Select
								bind:value={newColorPallet.mode_type}
								id="type"
								name="type"
								size="md"
								placeholder="Please select mode type"
							>
								<option value="dark">dark</option>
								<option value="light">light</option>
							</Select>
						</div>
					</div>

					<div class="grid lg:grid-cols-3 gap-4 py-5">
						<div class="flex flex-col items-center border rounded">
							<input
								class="w-full h-20"
								type="color"
								id="head"
								name="head"
								bind:value={newColorPallet.primaryColor}
							/>
							{#if isFormSubmitted && !newColorPallet?.primaryColor?.trim()}
								<p class="error-message">Require</p>
							{/if}
							<Label for="color" class="text-gray-500 py-2">primaryColor</Label>
							<span class="pb-2">{newColorPallet.primaryColor}</span>
						</div>
						<div class="flex flex-col items-center border rounded">
							<input
								class="w-full h-20"
								type="color"
								id="head"
								name="head"
								bind:value={newColorPallet.secondaryColor}
							/>
							{#if isFormSubmitted && !newColorPallet?.secondaryColor?.trim()}
								<p class="error-message">Require</p>
							{/if}
							<Label for="color" class="text-gray-500 py-2">secondaryColor</Label>
							<span class="pb-2">{newColorPallet.secondaryColor}</span>
						</div>
						<div class="flex flex-col items-center border rounded">
							<input
								class="w-full h-20"
								type="color"
								id="head"
								name="head"
								bind:value={newColorPallet.overlayPrimaryColor}
							/>
							{#if isFormSubmitted && !newColorPallet?.overlayPrimaryColor?.trim()}
								<p class="error-message">Require</p>
							{/if}
							<Label for="color" class="text-gray-500 py-2">overlayPrimaryColor</Label>

							<span class="pb-2">{newColorPallet.overlayPrimaryColor}</span>
						</div>
						<div class="flex flex-col items-center border rounded">
							<input
								class="w-full h-20"
								type="color"
								id="head"
								name="head"
								bind:value={newColorPallet.overlaySecondaryColor}
							/>
							{#if isFormSubmitted && !newColorPallet?.overlaySecondaryColor?.trim()}
								<p class="error-message">Require</p>
							{/if}
							<Label for="color" class="text-gray-500 py-2">overlaySecondaryColor</Label>
							<span class="pb-2">{newColorPallet.overlaySecondaryColor}</span>
						</div>
						<div class="flex flex-col items-center border rounded">
							<input
								class="w-full h-20"
								type="color"
								id="head"
								name="head"
								bind:value={newColorPallet.backgroundColor}
							/>
							{#if isFormSubmitted && !newColorPallet?.backgroundColor?.trim()}
								<p class="error-message">Require</p>
							{/if}
							<Label for="color" class="text-gray-500 py-2">backgroundColor</Label>
							<span class="pb-2">{newColorPallet.backgroundColor}</span>
						</div>
						<div class="flex flex-col items-center border rounded">
							<input
								class="w-full h-20"
								type="color"
								id="head"
								name="head"
								bind:value={newColorPallet.overlayBackgroundColor}
							/>
							{#if isFormSubmitted && !newColorPallet?.overlayBackgroundColor?.trim()}
								<p class="error-message">Require</p>
							{/if}
							<Label for="color" class="text-gray-500 py-2">overlayBackgroundColor</Label>
							<span class="pb-2">{newColorPallet.overlayBackgroundColor}</span>
						</div>
					</div>

					<button
						on:click|preventDefault={formSubmit}
						type="submit"
						class="flex items-center gap-2 bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
					>
						<IconPlus size={20} />
						Add new theme
					</button>
				</div>
			</form>
		</Modal>
	</div>
</div>

<style>
	.error-message {
		color: red;
	}
</style>
