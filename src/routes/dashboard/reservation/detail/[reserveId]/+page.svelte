<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import type { CompanyType } from '../../../../../models/companyModel';
	import type { ExhibitionModel } from '../../../../../models/exhibitionTypeModel';
	import { SeatsLayoutTypeEnum } from '../../../../../models/seatsLayoutTypeEnum';

	import { Button } from 'flowbite-svelte';
	import { generateDocx } from '$lib/utils/generateContract';
	import ReservedSeat from './reservedSeat.svelte';
	import { exhibition } from '../../../../../stores/exhibitionTypeStore';

	export let data;
	interface reservationType {
		id?: number;
		exhibition_id?: number;
		object_id?: number;
		comment?: [];
		services?: string[];
		company_id?: number;
		company?: CompanyType;
		exhibition?: ExhibitionModel;
		status?: ReservationStatusEnum;
		created_at?: Date;
		reserved_areas?: string;
		type: SeatsLayoutTypeEnum;
	}
	const objectId = $page.params.reserveId;
	let seatLayout: undefined | {} = undefined;

	let reservations: reservationType[] = [];

	onMount(async () => {
		getReservationData();
	});
	async function getReservationData() {
		await data.supabase
			.from('seat_reservation')
			.select('*,company(*),exhibition(*)')
			.eq('object_id', objectId)
			.then((Response) => {
				reservations = Response.data as reservationType[];
				if (reservations[0].type != SeatsLayoutTypeEnum.AREAFIELDS) {
					getSeatLayout();
				}
			});
	}

	async function getSeatLayout() {
		const response = await data.supabase
			.from('exhibition')
			.select('*,seat_layout(*)', { count: 'exact' })
			.eq('id', reservations[0].exhibition_id)
			.single();
		if (response.data.seat_layout) {
			seatLayout = response.data.seat_layout;
		}
	}
	async function updateStatus(itemID: any, selectedStatus: any) {
		if (selectedStatus == ReservationStatusEnum.ACCEPT) {
			await data.supabase
				.from('seat_reservation')
				.update({ status: ReservationStatusEnum.REJECT })
				.eq('object_id', objectId);
		}
		await data.supabase
			.from('seat_reservation')
			.update({ status: selectedStatus })
			.eq('id', itemID);
		getReservationData();
	}
	async function exportContract(reservationData: reservationType) {
		await data.supabase
			.from('contract_decode_files')
			.select('*')
			.eq('exhibition_id', reservationData.exhibition_id)
			.then(async (Response: any) => {
				let reservedAreasArray = reservationData.reserved_areas
					? JSON.parse(reservationData.reserved_areas)
					: [];
				console.log(reservationData);
				let price_per_meter = 0;
				await data.supabase
					.from('seat_layout')
					.select('*')
					.eq('exhibition', reservationData.exhibition_id)
					.eq('is_active', true)
					.single()
					.then((response) => {
						price_per_meter = response.data.price_per_meter;
					});
				let reservedAreas = reservedAreasArray?.map((data: any) => {
					let result = {
						id: data.id++,
						area: data.area,
						quantity: data.quantity,
						pricePerMeter: price_per_meter,
						totalPrice: data.quantity * price_per_meter,
						discountedPrice: data.quantity * price_per_meter * 0.9
					};
					return result;
				});
				let docxData = {
					company_name: reservationData.company?.company_name,
					address: reservationData.company?.address,
					phone_number: reservationData.company?.phone_number,
					manager_name: reservationData.company?.manager_name,
					passport_number: reservationData.company?.passport_number,
					working_field: reservationData.company?.working_field,
					areas: reservedAreas
				};
				console.log(docxData);
				generateDocx(Response.data[0].decoded_file, docxData);
			});
	}
	function getServices(service: string) {
		return JSON.parse(service ?? '');
	}
	function exportFile(reservation: any) {
		window.open(
			import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_FILE_URL + '/' + reservation?.file_url
		);
	}
</script>

<div class="w-full flex flex-col py-32 items-center" style="min-height: calc(100vh - 80px);">
	<div class="w-full lg:w-9/12">
		<table class="min-w-full border-collapse">
			<thead>
				<tr>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">company name</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">avatar</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">comment</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">company address</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">company phone number</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">exhibition type</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">reserved areas</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">services</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">change status</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">export contract data</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">export excel sheet</div>
					</th>
				</tr>
			</thead>

			<tbody class="dark:text-gray-300">
				{#each reservations as reservation}
					<tr class="border-2 border-[#edeff2]">
						<td>
							<div>{reservation.company?.company_name}</div>
						</td>

						<td>
							<div>{reservation.company?.logo_url}</div>
						</td>

						<td>
							<div>{reservation.company?.comment}</div>
						</td>
						<td>
							<div>{reservation.company?.address}</div>
						</td>

						<td>
							<div>{reservation.company?.phone_number}</div>
						</td>

						<td>
							<div>{reservation?.exhibition?.exhibition_type}</div>
						</td>
						<td>
							{#if reservation?.reserved_areas}
								{#each JSON.parse(reservation?.reserved_areas) as reservedAreaData}
									<div class="flex justify-between px-7">
										<div>{reservedAreaData.area} M</div>
										<div>{reservedAreaData.quantity}</div>
									</div>
								{/each}
							{/if}
						</td>
						<td>
							<div>
								{#if reservation?.services}
									{#each reservation?.services as service}
										<div
											class="flex flex-col border-b-2 border-[#696868] border-dashed justify-center items-center"
										>
											<h3>service name : {getServices(service)?.serviceDetail?.title}</h3>
											<h3>quantity : {getServices(service)?.quantity}</h3>
											<h3>price : {getServices(service)?.serviceDetail?.price}</h3>
											<h3>discpunt: {getServices(service)?.serviceDetail?.discount}</h3>
											<h3>total price : {getServices(service)?.totalPrice}</h3>
										</div>
									{/each}
								{/if}
							</div>
						</td>

						<td>
							<div class="flex justify-end py-3">
								<select
									class=" cursor-pointer font-medium text-center text-base hover:dark:bg-gray-200 hover:bg-gray-100 bg-[#e9ecefd2] dark:bg-gray-100 text-gray-900 dark:text-gray-900 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-300 focus:ring-offset-0"
									bind:value={reservation.status}
									on:change={() => updateStatus(reservation?.id, reservation.status)}
									disabled={reservation.status === ReservationStatusEnum.REJECT}
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
						</td>
						<td>
							<Button class="mx-2" on:click={() => exportContract(reservation)}>export</Button>
						</td>
						<td>
							<Button class="mx-2" on:click={() => exportFile(reservation)}>download</Button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if seatLayout}
			<ReservedSeat data={seatLayout} reservedData={reservations[0]} />
		{/if}
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
