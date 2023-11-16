<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Tooltip } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { SeatLayoutModel } from '../seats/seatLayoutStore';
	import { goto } from '$app/navigation';
	import { SeatsLayoutTypeEnum } from '../../../models/seatsLayoutTypeEnum';
	export let data: PageData;

	$: ({ supabase } = data);
	let designs: SeatLayoutModel[] | undefined;
	let seatsAreaFieldsType: SeatLayoutModel[] = [];
	async function getData() {
		if (!supabase) return;
		const seatsData = await supabase.from('seat_layout').select('*');
		seatsAreaFieldsType =
			seatsData.data?.filter((seat) => {
				return seat.type == SeatsLayoutTypeEnum.AREAFIELDS;
			}) ?? [];
		seatsData.data =
			seatsData.data?.filter((seat) => {
				return seat.type !== SeatsLayoutTypeEnum.AREAFIELDS;
			}) ?? [];
		designs = seatsData.data?.map((seat) => {
			return seat as SeatLayoutModel;
		});
	}
	onMount(async () => {
		getData();
	});

	function openSeatDesignEditor(design: any) {
		goto(`seats_ui/${design.id}`);
	}

	function createNewDesign() {
		goto(`seats_ui/create`);
	}
	function getAreaDetail(area?: string) {
		let result = [];
		if (area) {
			try {
				result = JSON.parse(area);
			} catch (e) {}
		}
		return result;
	}

	function openSeatInfo(seatId: any) {
		goto(`seats_ui/seatInfo/${seatId.id}`);
	}
</script>

<div class="flex flex-col justify-start items-center bg-secondary w-full pt-10 min-h-screen">
	<div>
		<Button on:click={createNewDesign}>Create New Seat Design</Button>
	</div>
	<div class="px-4 grid grid-cols-3 gap-4 mt-10">
		{#if designs}
			{#each designs as design}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="w-52 hover:shadow-sm duration-300 h-52 flex flex-col p-0 border rounded-2xl border-gray-600"
				>
					<div
						class="h-32 w-full bg-black rounded-tl-2xl rounded-tr-2xl cursor-pointer"
						on:click={() => openSeatDesignEditor(design)}
					>
						<!-- svelte-ignore a11y-missing-attribute -->
						<img
							class="object-cover w-full h-full rounded-tl-2xl rounded-tr-2xl"
							src={import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL + '/' + design.image_url}
						/>
					</div>

					<div class="flex justify-between px-2 items-center h-5">
						<h5
							class=" font-bold tracking-tight text-white bg-secondary flex-1 flex justify-start items-start p-2 rounded-bl-2xl rounded-br-2xl"
						>
							{design.name}
						</h5>
					</div>
					<div class="flex justify-end px-2 items-center my-2 h-10">
						<!-- Add require field -->
						<button
							on:click={() => openSeatInfo(design)}
							class="p-2 tetx-white rounded-full bg-primary-200 text-white flex justify-center items-center font-bold"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-4 h-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
								/>
							</svg>
						</button>
						<Tooltip placement="bottom">Update seat data</Tooltip>
						<div
							class={`h-3 w-3 mx-2 ${
								design.is_active ? 'bg-[#31c48d]' : 'bg-[#cc2827]'
							} rounded-full`}
						/>
					</div>
				</div>
			{/each}
		{/if}
	</div>
	<div class="px-4 mt-10 w-full lg:w-10/12">
		<div class="my-6 flex w-full justify-between">
			<div><h1 class="text-white text-lg font-bold">reservation by area</h1></div>
			<div>
				<Button on:click={() => goto('seats_ui/reservation_by_area')}>add new area</Button>
			</div>
		</div>
		<table class="min-w-full border-collapse">
			<thead>
				<tr>
					<th class="table_header">
						<div class="flex items-center gap-2">name</div>
					</th>
					<th class="table_header">
						<div class="flex items-center gap-2">is active</div>
					</th>
					<th class="table_header">
						<div class="flex items-center gap-2">ares</div>
					</th>
					<th class="table_header">
						<div class="flex items-center gap-2">go to detail</div>
					</th>
				</tr>
			</thead>

			<tbody class="dark:text-gray-300">
				{#each seatsAreaFieldsType as seat}
					<tr class="border-2 border-[#edeff2] text-white">
						<td>
							<div>{seat.name}</div>
						</td>
						<td>
							{#if seat.is_active}
								<div class="flex items-center">
									<div class="mx-2 bg-[#31c48d] rounded-full h-3 w-3" />
									Active
								</div>
							{:else}
								<div class="flex items-center">
									<div class="mx-2 bg-[#cc2827] rounded-full h-3 w-3" />
									Inactive
								</div>
							{/if}
						</td>
						<td>
							<div>
								{#each getAreaDetail(seat.areas) as areaDetail}
									<div class="my-3">
										area: {areaDetail.area} M<span class="mx-4">
											quantity:{areaDetail.quantity}
										</span>
									</div>
								{/each}
							</div>
						</td>

						<td>
							<Button class="m-2" on:click={() => goto(`seats_ui/reservation_by_area/${seat.id}`)}
								>Detail</Button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.table_header {
		padding: 0.75rem;
		font-weight: 600;
		font-weight: 600;
		background-color: #e9ecefd2;
		color: rgb(75 85 99 / var(--tw-text-opacity));
		font-size: 0.875rem;
		line-height: 1.25rem;

		border-width: 1px;
		display: table-cell;
	}
</style>
