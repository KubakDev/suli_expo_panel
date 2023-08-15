<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getSeatServiceById, seatServices } from '../../../../../stores/seatServicesStore';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import type { Reservation } from '../../../../../models/reservationModel';
	import { Avatar } from 'flowbite-svelte';
	import type { seatServicesModel } from '../../../../../models/seatServicesModel';
	import ReservedSeat from './reservedSeat.svelte';
	import {
		getReservationById,
		seatReservation,
		updateData
	} from '../../../../../stores/reservationStore';

	const params = $page.params.reserveId;
	export let data;

	let loadingServiceData = true;

	let reservationData: Reservation = {};
	let serviceData: seatServicesModel = {};
	let seatLayout: undefined | {} = undefined;
	let serviceID: any;

	onMount(async () => {
		try {
			const fetchedReservationData = await getReservationById(data.supabase, params);
			reservationData = fetchedReservationData;
			if (reservationData.services) {
				const servicesArray = JSON.parse(reservationData.services[0]);
				serviceID = servicesArray.serviceId;
				getServiceDetail(serviceID);
			}

			getSeatLayout();
		} catch (error) {
			console.log(error);
		}
	});

	async function updateStatus(itemID: any, selectedStatus: any) {
		const updatedReservation = { ...$seatReservation };

		if (updatedReservation.id === itemID) {
			updatedReservation.status = selectedStatus;
			await updateData(data.supabase, itemID, { status: selectedStatus });
		}

		seatReservation.set(updatedReservation);
	}
	async function getSeatLayout() {
		const response = await data.supabase
			.from('exhibition')
			.select('*,seat_layout(*)', { count: 'exact' })
			.eq('id', reservationData.exhibition_id)
			.single();
		if (response.data.seat_layout) {
			seatLayout = response.data.seat_layout;
		}
	}

	async function getServiceDetail(serviceID: any) {
		console.log(serviceID);
		serviceData = await getSeatServiceById(data.supabase, serviceID);
		console.log(serviceData);
		loadingServiceData = false; // Update loading state after data is loaded
	}
</script>

<div class="max-w-screen-2xl mx-auto py-10 body-font">
	<div class="container px-5 py-5 mx-auto">
		<div class="flex justify-center pb-5">
			<Avatar
				src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${
					reservationData?.company?.logo_url
				}`}
				size="xl"
			/>
		</div>
		<!-- top section  -->
		<div class="flex flex-col text-center w-full mb-20">
			<h2 class="text-2xl text-primary-100 tracking-widest font-medium title-font mb-1">
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
			<p class="lg:w-2/3 mx-auto leading-relaxed text-base">
				{reservationData?.comment}
			</p>
		</div>

		<!-- change status -->
		<div class="flex justify-end py-3">
			<select
				class="text-black rounded-md"
				bind:value={reservationData.status}
				on:change={() => updateStatus(reservationData?.id, reservationData.status)}
			>
				<option value={ReservationStatusEnum.PENDING}>{ReservationStatusEnum.PENDING}</option>
				<option value={ReservationStatusEnum.ACCEPT}>{ReservationStatusEnum.ACCEPT}</option>
				<option value={ReservationStatusEnum.REJECT}>{ReservationStatusEnum.REJECT}</option>
			</select>
		</div>

		<!-- detail section -->
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

		<!-- service detail -->
		<div class="pt-5" />

		{#if loadingServiceData}
			<p>Loading...</p>
		{:else}
			<div class="flex flex-wrap dark:bg-gray-900 bg-white shadow border dark:border-gray-800">
				<div
					class="xl:w-1/5 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60"
				>
					<h2
						class="text-lg sm:text-xl dark:text-gray-300 text-gray-900 font-medium title-font mb-2"
					>
						service title
					</h2>
					<p class="leading-relaxed text-base mb-4">
						{#if serviceData.seat_services_languages}
							{#each serviceData.seat_services_languages as language}
								<div>
									<p>Language: {language.language}</p>
									<p>Title: {language.title}</p>
									<p>Description: {language.description}</p>
								</div>
							{/each}
						{/if}
					</p>
				</div>
				<div
					class="xl:w-1/5 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60"
				>
					<h2
						class="text-lg sm:text-xl dark:text-gray-300 text-gray-900 font-medium title-font mb-2"
					>
						service price
					</h2>
					<p class="leading-relaxed text-base mb-4">{serviceData?.price}</p>
				</div>
				<div
					class="xl:w-1/5 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60"
				>
					<h2
						class="text-lg sm:text-xl dark:text-gray-300 text-gray-900 font-medium title-font mb-2"
					>
						service quantity
					</h2>
					<p class="leading-relaxed text-base mb-4">{serviceData.quantity}</p>
				</div>
				<div
					class="xl:w-1/5 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60"
				>
					<h2
						class="text-lg sm:text-xl dark:text-gray-300 text-gray-900 font-medium title-font mb-2"
					>
						service discount
					</h2>
					<p class="leading-relaxed text-base mb-4">{serviceData?.discount}</p>
				</div>
				<div
					class="xl:w-1/5 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60"
				>
					<h2
						class="text-lg sm:text-xl dark:text-gray-300 text-gray-900 font-medium title-font mb-2"
					>
						service type
					</h2>
					<p class="leading-relaxed text-base mb-4">{serviceData?.type}</p>
				</div>
			</div>
		{/if}

		<!-- seatLayout -->

		{#if seatLayout}
			<ReservedSeat supabase={data.supabase} data={seatLayout} reservedData={reservationData} />
		{/if}
	</div>
</div>
