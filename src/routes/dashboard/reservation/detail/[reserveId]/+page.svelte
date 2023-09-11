<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getSeatServicesByIds, seatServices } from '../../../../../stores/seatServicesStore';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import type { Reservation } from '../../../../../models/reservationModel';
	import { Avatar } from 'flowbite-svelte';
	import ReservedSeat from './reservedSeat.svelte';
	import {
		getReservationById,
		seatReservation,
		updateData
	} from '../../../../../stores/reservationStore';

	const params = $page.params.reserveId;
	$: console.log(params);
	export let data;

	let reservationData: Reservation = {};
	let serviceData: any = [];
	let seatLayout: undefined | {} = undefined;
	let serviceID: any = [];
	let quantityNumber: any = [];

	// onMount(async () => {
	// 	try {
	// 		const fetchedReservationData = await getReservationById(data.supabase, params);
	// 		reservationData = fetchedReservationData;

	// 		if (reservationData.services) {
	// 			const servicesArray = reservationData.services;

	// 			servicesArray.map((serviceString) => {
	// 				const serviceObj = JSON.parse(serviceString);

	// 				serviceID.push(serviceObj.serviceId);
	// 			});

	// 			servicesArray.map((serviceString) => {
	// 				const serviceObj = JSON.parse(serviceString);

	// 				quantityNumber.push(serviceObj.quantity);
	// 			});
	// 			//
	// 			//

	// 			getServiceDetails(serviceID);
	// 		}

	// 		getSeatLayout();
	// 	} catch (error) {}
	// });

	// async function updateStatus(itemID: any, selectedStatus: any) {
	// 	const updatedReservation: any = { ...$seatReservation };

	// 	if (updatedReservation.id === itemID) {
	// 		updatedReservation.status = selectedStatus;
	// 		await updateData(data.supabase, itemID, { status: selectedStatus }, $seatReservation);
	// 	}

	// 	seatReservation.set(updatedReservation);
	// }
	// async function getSeatLayout() {
	// 	const response = await data.supabase
	// 		.from('exhibition')
	// 		.select('*,seat_layout(*)', { count: 'exact' })
	// 		.eq('id', reservationData.exhibition_id)
	// 		.single();
	// 	if (response.data.seat_layout) {
	// 		seatLayout = response.data.seat_layout;
	// 	}
	// }

	// async function getServiceDetails(serviceIDs: any) {
	// 	try {
	// 		serviceData = await getSeatServicesByIds(data.supabase, serviceIDs);
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// }

	// function findTotalPrice(item: any, price: number, quantity: number) {
	// 	return (item.discount ?? price) * (quantity ?? 0);
	// }
</script>

<!-- <div class="max-w-screen-2xl mx-auto py-10 body-font">
	<div class="container px-5 py-5 mx-auto">
		<div class="flex justify-center pb-5">
			<Avatar
				src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
					reservationData?.company?.logo_url
				}`}
				size="xl"
			/>
		</div>
		top section 
		<div class="flex flex-col text-center w-full mb-0">
			<h2
				class="text-3xl text-gray-900 dark:text-gray-100 tracking-widest font-medium title-font mb-1"
			>
				{reservationData.company?.company_name}
			</h2>
			<h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 dark:text-gray-300 text-gray-900">
				<div class="flex justify-center lg:gap-5 pt-4">
					<p class="dark:text-gray-400 flex items-center text-sm">
						<span class="mr-3"
							><svg
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
							>
								<path
									d="M22 2H2C0.9 2 0.00999999 2.9 0.00999999 4L0 20C0 21.1 0.9 22 2 22H22C23.1 22 24 21.1 24 20V4C24 2.9 23.1 2 22 2ZM22 6L12 13L2 6H22ZM2 8.74L12 15.74L22 8.74V20H2V8.74Z"
									fill="#d3d3d3"
								/>
							</svg>
						</span>
						{reservationData.company?.email}
					</p>
					<p class="dark:text-gray-400 flex items-center text-sm">
						<span class="mr-3"
							><svg
								class="w-5 h-5 text-[#d3d3d3] dark:text-[#d3d3d3]"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 18 18"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="m16.344 12.168-1.4-1.4a1.98 1.98 0 0 0-2.8 0l-.7.7a1.98 1.98 0 0 1-2.8 0l-2.1-2.1a1.98 1.98 0 0 1 0-2.8l.7-.7a1.981 1.981 0 0 0 0-2.8l-1.4-1.4a1.828 1.828 0 0 0-2.8 0C-.638 5.323 1.1 9.542 4.78 13.22c3.68 3.678 7.9 5.418 11.564 1.752a1.828 1.828 0 0 0 0-2.804Z"
								/>
							</svg></span
						>{reservationData.company?.phone_number}
					</p>
				</div>
			</h1>
			<p class="lg:w-2/3 mx-auto leading-relaxed text-base dark:text-gray-300 text-gray-600">
				{reservationData?.comment}
			</p>
		</div>

		change status
		<div class="flex justify-end py-3">
			<select
				class=" cursor-pointer font-medium text-center text-base hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 focus:ring-offset-0"
				bind:value={reservationData.status}
				on:change={() => updateStatus(reservationData?.id, reservationData.status)}
				disabled={reservationData.status === ReservationStatusEnum.REJECT}
			>
				<option value={ReservationStatusEnum.PENDING}>{ReservationStatusEnum.PENDING}</option>
				<option value={ReservationStatusEnum.ACCEPT}>{ReservationStatusEnum.ACCEPT}</option>
				<option value={ReservationStatusEnum.REJECT}>{ReservationStatusEnum.REJECT}</option>
			</select>
		</div>

		detail section
		<div class="flex flex-wrap dark:bg-gray-900 bg-white shadow border dark:border-gray-800">
			<div
				class="xl:w-2/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60"
			>
				<h2 class="text-lg sm:text-xl dark:text-gray-300 text-gray-900 font-medium title-font mb-2">
					Exhibition Type
				</h2>
				<p class="leading-relaxed text-base mb-4">
					{reservationData.exhibition?.exhibition_type}
				</p>
			</div>
			<div
				class="xl:w-2/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60"
			>
				<h2 class="text-lg sm:text-xl dark:text-gray-300 text-gray-900 font-medium title-font mb-2">
					Company Type
				</h2>
				<p class="leading-relaxed text-base mb-4">{reservationData.company?.type}</p>
			</div>
		</div>

		service detail
		<div class="pt-5" />
		table data

		<div class="overflow-x-auto rounded">
			<div class="min-w-full table-responsive">
				<table class="min-w-full border-collapse">
					<thead>
						<tr>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex justify-start items-center gap-2">
									<span>#</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Title</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-start gap-2">
									<span>Description</span>
								</div>
							</th>

							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Type </span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Quantity</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Price</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Discount</span>
								</div>
							</th>
							<th
								class="p-3 font-semibold uppercase bg-[#e9ecefd2] text-gray-600 text-sm border border-gray-200 dark:border-gray-800 table-cell"
							>
								<div class="flex items-center gap-2">
									<span>Total Price</span>
								</div>
							</th>
						</tr>
					</thead>

					<tbody>
						{#if serviceData}
							{#each serviceData as item, index}
								<tr>
									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>
											{index + 1}
										</div>
									</td>
									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>{item.seat_services_languages[0].title}</div>
									</td>
									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>{item.seat_services_languages[0].description}</div>
									</td>
									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>{item.type}</div>
									</td>
									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>{quantityNumber[index]}</div>
									</td>

									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div>{item.price}IQD</div>
									</td>

									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="text-base font-bold">{item.discount}IQD</div>
									</td>
									<td
										class="p-3 text-center bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
									>
										<div class="text-xl font-bold">
											{findTotalPrice(item, item.price, quantityNumber[index])}IQD
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		seatLayout

		{#if seatLayout}
			<ReservedSeat data={seatLayout} reservedData={reservationData} />
		{/if}
	</div>
</div> -->
