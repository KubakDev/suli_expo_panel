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

<div class="max-w-screen-2xl mx-auto py-10 px-4">
	<!-- show data on the table -->

	<div class="py-5 px-4 lg:px-0 flex justify-end">
		<button
			on:click={() => (showModal = true)}
			class="bg-[#e9ecefd2] dark:bg-[#e9ecefd2] dark:hover:bg-gray-100 flex text-black gap-2 p-2 rounded-sm shadow-md border"
		>
			<svg
				width="20px"
				height="20px"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
			>
				<g id="SVGRepo_bgCarrier" stroke-width="0" />

				<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

				<g id="SVGRepo_iconCarrier">
					<path
						fill="#6b6b6b"
						fill-rule="evenodd"
						d="M9 17a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3a1 1 0 10-2 0v6H3a1 1 0 000 2h6v6z"
					/>
				</g>
			</svg>
		</button>
	</div>

	<!-- table data -->
	<div class="overflow-x-auto rounded">
		<div class="min-w-full table-responsive">
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell w-10"
						>
							<div class="flex justify-center items-center gap-2">
								<span>No</span>
							</div>
						</th>

						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>Name Of Theme</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>Primary Color</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>Secondary Color</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>overlay Primary Color</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>overlay Secondary Color</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>background color</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>overlay background color</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span>Mode Type</span>
							</div>
						</th>
						<th
							class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
						>
							<div class="flex items-center justify-center gap-2">
								<span
									><svg
										width="20px"
										height="20px"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										fill="#65686c"
										><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
											id="SVGRepo_tracerCarrier"
											stroke-linecap="round"
											stroke-linejoin="round"
										/><g id="SVGRepo_iconCarrier"
											><path
												d="M9.5 2h-6A1.502 1.502 0 0 0 2 3.5v6A1.502 1.502 0 0 0 3.5 11h6A1.502 1.502 0 0 0 11 9.5v-6A1.502 1.502 0 0 0 9.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 2h-6A1.502 1.502 0 0 0 13 3.5v6a1.502 1.502 0 0 0 1.5 1.5h6A1.502 1.502 0 0 0 22 9.5v-6A1.502 1.502 0 0 0 20.5 2zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM9.5 13h-6A1.502 1.502 0 0 0 2 14.5v6A1.502 1.502 0 0 0 3.5 22h6a1.502 1.502 0 0 0 1.5-1.5v-6A1.502 1.502 0 0 0 9.5 13zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5zM20.5 13h-6a1.502 1.502 0 0 0-1.5 1.5v6a1.502 1.502 0 0 0 1.5 1.5h6a1.502 1.502 0 0 0 1.5-1.5v-6a1.502 1.502 0 0 0-1.5-1.5zm.5 7.5a.501.501 0 0 1-.5.5h-6a.501.501 0 0 1-.5-.5v-6a.501.501 0 0 1 .5-.5h6a.501.501 0 0 1 .5.5z"
											/><path fill="none" d="M0 0h24v24H0z" /></g
										></svg
									></span
								> <span>Actions</span>
							</div>
						</th>
					</tr>
				</thead>

				<tbody>
					{#each $theme as item, index (item.id)}
						<tr>
							<td class="w-3 p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center text-gray-500">{index + 1}</div>
							</td>
							<td
								class="w-44 p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex justify-center">
									<p class="w-20 p-2 rounded dark:text-white font-sans">
										{item.name}
									</p>
								</div>
							</td>

							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center">
									<div
										class="w-20 p-2 rounded text-white border-4"
										style="background: {`${item.primaryColor}`};"
									>
										{item.primaryColor}
									</div>
								</div>
							</td>

							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center">
									<div
										class="w-20 p-2 rounded text-white border-4"
										style="background: {`${item.secondaryColor}`};"
									>
										{item.secondaryColor}
									</div>
								</div>
							</td>

							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center">
									<div
										class="w-20 p-2 rounded text-white border-4"
										style="background: {`${item.overlayPrimaryColor}`};"
									>
										{item.overlayPrimaryColor}
									</div>
								</div>
							</td>

							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center">
									<div
										class="w-20 p-2 rounded text-white border-4"
										style="background: {`${item.overlaySecondaryColor}`};"
									>
										{item.overlaySecondaryColor}
									</div>
								</div>
							</td>

							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center">
									<div
										class="w-20 p-2 rounded text-white border-4"
										style="background: {`${item.backgroundColor}`};"
									>
										{item.backgroundColor}
									</div>
								</div>
							</td>

							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center">
									<div
										class="w-20 p-2 rounded text-white border-4"
										style="background: {`${item.overlayBackgroundColor}`};"
									>
										{item.overlayBackgroundColor}
									</div>
								</div>
							</td>
							<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
								<div class="flex justify-center">
									{item.mode_type}
								</div>
							</td>

							<td
								class="p-3 font- bg-gray-10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell w-32"
							>
								<div class="flex justify-between items-center">
									<div class="flex justify-between items-center gap-4 px-2">
										<div>
											{#if item.active}
												<span class="text-green-600 font-bold">Active</span>
											{:else}
												<span class="text-red-600">Inactive</span>
											{/if}
										</div>
										<div>
											<!-- <Toggle
												class="rounded px-2   hover:bg-gray-100 dark:hover:bg-gray-600"
												checked={item.active}
												on:change={() => toggleChanged(item)}
											/> -->

											<div class="flex justify-end items-center mr-5">
												<label class="relative inline-flex items-center cursor-pointer">
													<input
														on:change={() => toggleChanged(item)}
														type="checkbox"
														value=""
														class="sr-only peer"
														bind:checked={item.active}
													/>
													<div
														class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"
													/>
												</label>
											</div>
										</div>
									</div>

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
						class="flex bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
					>
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
