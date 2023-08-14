<script lang="ts">
	import { onMount } from 'svelte';
	import {
		seatReservation,
		getReservationData,
		updateData
	} from '../../../stores/reservationStore';
	import { ReservationStatusEnum } from '../../../models/reservationEnum';
	import type { ExhibitionModel } from '../../../models/exhibitionTypeModel';
	import { getDataExhibition } from '../../../stores/exhibitionTypeStore';
	import { Checkbox, Label, Search, TableSearch } from 'flowbite-svelte';
	import { Button, Dropdown, DropdownItem, Radio } from 'flowbite-svelte';
	import { Icon } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	export let data;
	let selectedExhibition: number[];
	let searchQuery = ''; // Variable to store the search query
	let searchField: any = null;

	async function fetchReservationData() {
		await getReservationData(data.supabase);
	}
	onMount(fetchReservationData);

	async function updateStatus(itemID: any, selectedStatus: any) {
		const updatedData = $seatReservation.map((reservation) => {
			if (itemID === reservation.id) {
				return { ...reservation, status: selectedStatus };
			}
			return reservation;
		});

		for (const reservation of updatedData) {
			if (itemID === reservation.id) {
				await updateData(data.supabase, reservation.id, { status: selectedStatus });
			}
		}

		fetchData();
	}

	let exhibitionData: ExhibitionModel[] = [];

	const fetchData = async () => {
		try {
			exhibitionData = await getDataExhibition(data.supabase);

			let uniqueTypes = exhibitionData.filter((item, index, array) => {
				return !array
					.slice(0, index)
					.some((prevItem) => prevItem.exhibition_type === item.exhibition_type);
			});
			exhibitionData = uniqueTypes;
		} catch (error) {
			console.error(error);
		}
	};

	onMount(fetchData);

	async function filterByExhibition() {
		if (selectedExhibition !== null) {
			await getReservationData(data.supabase, [selectedExhibition]);
		} else {
			await getReservationData(data.supabase);
		}
	}

	//create checkboxes
	const options = ['company name', 'company phoneNumber', 'company email'];
	let checked: any = {};

	function selectOneCheckbox(index: number) {
		const option = options[index];

		// Uncheck all checkboxes first
		for (const opt of options) {
			checked[opt] = false;
		}

		// Check the selected checkbox
		checked[option] = true;
	}

	async function filterByCompany() {
		if (searchQuery && searchField !== null) {
			await getReservationData(data.supabase, null, searchField, searchQuery);
		} else {
			await getReservationData(data.supabase);
		}
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10">
	<!-- filtering by exhibition -->
	<div class="py-5 px-4 lg:px-0 flex justify-end items-center gap-5">
		<div class="mb-6 w-44 flex flex-col">
			<Label for="website-admin" class="block mb-2">Filter By Exhibition Type</Label>
			<select
				class="dark:text-gray-900 border border-gray-300 rounded w-full focus:ring-0 focus:rounded-l-md focus:border-gray-300 focus:ring-offset-0"
				id="type"
				name="type"
				bind:value={selectedExhibition}
				on:change={filterByExhibition}
			>
				<option value={null}>All Exhibitions</option>
				{#each exhibitionData as item (item.id)}
					<option value={item.id}>{item.exhibition_type}</option>
				{/each}
			</select>
		</div>

		<!-- filtering by company -->

		<div>
			<Button>
				Filter By company info <Icon
					name="chevron-down-solid"
					class="w-3 h-3 ml-2 text-white dark:text-white"
				/>
			</Button>
			<Dropdown class="p-3 space-y-3 text-sm">
				<input type="search" class="rounded" name="" id="" />
				{#each options as option, index}
					<div class="option">
						<input
							type="checkbox"
							name="selectedOptions"
							value={option}
							id="option{index}"
							on:change={() => selectOneCheckbox(index)}
							checked={checked[option]}
						/>
						<label for="option{index}">{option}</label>
					</div>
				{/each}
			</Dropdown>
		</div>
	</div>

	<!-- table data -->
	<div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>#</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>company name</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>company phone_number</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>exhibition type </span>
								</div>
							</th>

							<th
								class=" w-48 p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-start gap-2">
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
									>
									<span>Actions</span>
								</div>
							</th>
						</tr>
					</thead>

					<tbody class="dark:text-gray-300">
						{#if $seatReservation.length > 0}
							{#each $seatReservation as item, index (item.id)}
								<tr>
									<td
										class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell w-10"
									>
										<div>
											{index + 1}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{item?.company?.company_name}
										</div>
									</td>

									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{item?.company?.phone_number}
										</div>
									</td>
									<td class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell">
										<div>
											{item?.exhibition?.exhibition_type}
										</div>
									</td>

									<td
										class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 flex justify-between items-center gap-4"
									>
										<div>
											<select
												class="text-black"
												bind:value={item.status}
												on:change={() => updateStatus(item.id, item.status)}
											>
												<option value={ReservationStatusEnum.PENDING}
													>{ReservationStatusEnum.PENDING}</option
												>
												<option value={ReservationStatusEnum.ACCEPT}
													>{ReservationStatusEnum.ACCEPT}</option
												>
												<option value={ReservationStatusEnum.REJECT}
													>{ReservationStatusEnum.REJECT}</option
												>
											</select>
										</div>

										<div>
											<button
												on:click={() => {
													goto(`/dashboard/reservation/detail/${item.id}`);
												}}
												class="text-gray-300"
												>view
											</button>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
