<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import type { CompanyType } from '../../../../../models/companyModel';
	import type { ExhibitionModel } from '../../../../../models/exhibitionTypeModel';
	import { SeatsLayoutTypeEnum } from '../../../../../models/seatsLayoutTypeEnum';
	import { Button, Checkbox } from 'flowbite-svelte';
	import { generateDocx } from '$lib/utils/generateContract';
	import ReservedSeat from './reservedSeat.svelte';
	import moment from 'moment';
	import { LanguageEnum } from '../../../../../models/languageEnum';
	import { convertNumberToWord } from '$lib/utils/numberToWordLang';

	export let data;

	let languages = Object.values(LanguageEnum);
	let discountedPrice = 0;
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
	let objectId = $page.params.reserveId;
	let seatLayout: undefined | {} = undefined;
	let extraDiscountChecked = false;
	let reservations: reservationType[] = [];
	let reservedSeatData: any = [];
	let exhibitionId = 0;
	onMount(async () => {
		objectId = $page.params.reserveId;
		getReservationData();
	});
	async function getReservationData() {
		await data.supabase
			.from('seat_reservation')
			.select('*,company(*),exhibition(*,exhibition_languages(*))')
			.eq('object_id', objectId)
			.then((Response) => {
				reservations = Response.data as reservationType[];
				reservedSeatData = JSON.parse(reservations[0]?.reserved_areas ?? '[]');
				if (reservations[0]?.type != SeatsLayoutTypeEnum.AREAFIELDS) {
					getSeatLayout();
				}
				exhibitionId = reservations[0]?.exhibition?.id ?? 0;
				calculateTotalPrice();
			});
	}

	async function getSeatLayout() {
		const response = await data.supabase
			.from('exhibition')
			.select('*,seat_layout(*)', { count: 'exact' })
			.eq('id', reservations[0]?.exhibition_id)
			.single();
		if (response?.data?.seat_layout) {
			seatLayout = response?.data?.seat_layout;
		}
	}
	function statusMessage(status: ReservationStatusEnum, lang: LanguageEnum) {
		let result = '';
		if (lang == LanguageEnum.EN) {
			switch (status) {
				case ReservationStatusEnum.ACCEPT:
					result = 'this reserve is accepted by admin';
					return result;
				case ReservationStatusEnum.REJECT:
					result = 'this reserve is rejected by admin';
					return result;
			}
		}
		if (lang == LanguageEnum.CKB) {
			switch (status) {
				case ReservationStatusEnum.ACCEPT:
					result = 'داواکاری شوێنگرتن وەرگیرا';
					return result;
				case ReservationStatusEnum.REJECT:
					result = 'داواکاری شوێنگرتن ڕەتکرایەوە';
					return result;
			}
		}
		if (lang == LanguageEnum.AR) {
			switch (status) {
				case ReservationStatusEnum.ACCEPT:
					result = 'قبلت';
					return result;
				case ReservationStatusEnum.REJECT:
					result = 'مرفوض';
					return result;
			}
		}
		return result;
	}
	function addNotificationData(reserveData: any, lang: LanguageEnum) {
		return {
			message: statusMessage(reserveData.status!, lang),
			language: lang,
			company_id: reserveData.company.id,
			exhibition_name:
				reserveData.exhibition?.exhibition_languages?.find(
					(exhibitionLanguage: any) => exhibitionLanguage.language == lang
				)?.title ?? '',
			seen: false,
			status: reserveData.status,
			unique_id:
				reserveData.id +
				'-' +
				reserveData.company.id +
				'-' +
				reserveData.exhibition_id +
				'-' +
				reserveData.status
		};
	}
	async function updateStatus(itemID?: number, selectedStatus?: string) {
		if (itemID == undefined || selectedStatus == undefined) return;
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
		reservations.map(async (reserveData) => {
			if (reserveData.status == ReservationStatusEnum.PENDING) return;
			await data.supabase
				.from('notification')
				.insert([
					addNotificationData(reserveData, LanguageEnum.EN),
					addNotificationData(reserveData, LanguageEnum.CKB),
					addNotificationData(reserveData, LanguageEnum.AR)
				])
				.then((response) => {});
		});
	}

	let totalPrice = 0;
	let totalArea = 0;
	let totalRawPrice = 0;
	let pricePerMeter = 0;
	let reservedAreas: any = [];
	let decodedFile = '';
	async function exportContract(reservationData: reservationType, lang: LanguageEnum) {
		let docxData = {
			company_name: reservationData.company?.company_name,
			address: reservationData.company?.address,
			phone_number: reservationData.company?.phone_number,
			manager_name: reservationData.company?.manager_name,
			passport_number: reservationData.company?.passport_number,
			working_field: reservationData.company?.working_field,
			areas: reservedAreas,
			date: moment(new Date()).format('DD/MM/YYYY'),
			id: reservationData.company?.id,
			email: reservationData.company?.email,
			pricePerMeter,
			totalArea,
			totalRawPrice,
			totalPrice,
			totalPriceText: convertNumberToWord(totalPrice, lang),
			totalRawPriceText: convertNumberToWord(totalRawPrice, lang),
			totalAreaText: convertNumberToWord(totalArea, lang)
		};
		await data.supabase
			.from('contract_decode_files')
			.select('*')
			.eq('exhibition_id', exhibitionId)
			.eq('language', lang)
			.then(async (Response: any) => {
				generateDocx(Response.data[0].decoded_file, docxData);
			});
	}
	async function calculateTotalPrice() {
		await data.supabase
			.from('contract_decode_files')
			.select('*')
			.eq('exhibition_id', exhibitionId)
			.then(async (Response: any) => {
				if (Response.data.length === 0) {
					return;
				}
				decodedFile = Response?.data[0]?.decoded_file;
				await data.supabase
					.from('seat_layout')
					.select('*')
					.eq('exhibition', exhibitionId)
					.eq('is_active', true)
					.single()
					.then((response) => {
						pricePerMeter = response.data.price_per_meter;
						if (extraDiscountChecked) {
							discountedPrice = response.data.extra_discount;
						} else {
							discountedPrice = response.data.discounted_price;
						}
					});
				reservedAreas = reservedSeatData?.map((data: any) => {
					let result = {
						id: data.id++,
						area: data.area,
						quantity: data.quantity,
						pricePerMeter: pricePerMeter,
						totalPrice: data.quantity * pricePerMeter * +data.area,
						discountedPrice: +data.area * (discountedPrice ?? pricePerMeter)
					};
					return result;
				});
				reservedAreas.map((seatArea: any) => {
					totalArea += +seatArea.area * +seatArea.quantity;
					totalPrice += +seatArea.quantity * +(discountedPrice ?? pricePerMeter) * +seatArea.area;
					totalRawPrice += +seatArea.quantity * pricePerMeter * +seatArea.area;
				});
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
						<div class="flex flex-col items-center gap-2 justify-between">
							contract file
							<div class="flex items-center">
								<Checkbox bind:checked={extraDiscountChecked} />enable extra discount
							</div>
						</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">export excel sheet</div>
					</th>
					<th class="table_header dark:border-gray-800">
						<div class="flex items-center gap-2">total price</div>
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
											<h3>discount: {getServices(service)?.serviceDetail?.discount}</h3>
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
							{#each languages as lang}
								<Button class="m-2" on:click={() => exportContract(reservation, lang)}
									>export {lang}</Button
								>
							{/each}
						</td>
						<td>
							<Button class="mx-2" on:click={() => exportFile(reservation)}>download</Button>
						</td>
						<td>
							<div class="mx-4">
								{#if discountedPrice}
									<p
										class="text-start justify-center flex my-2 line-through text-xs md:text-xl
									"
									>
										{totalRawPrice}$
									</p>
								{/if}

								<p
									class=" text-start text-md text-[#e1b168] md:text-xl font-medium justify-center flex my-2"
								>
									{totalPrice}$
								</p>
							</div>
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
