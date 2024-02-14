<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import type { CompanyType } from '../../../../../models/companyModel';
	import type { ExhibitionModel } from '../../../../../models/exhibitionTypeModel';
	import { SeatsLayoutTypeEnum } from '../../../../../models/seatsLayoutTypeEnum';
	import { Breadcrumb, BreadcrumbItem, Button, Checkbox, Modal } from 'flowbite-svelte';
	import { generateDocx } from '$lib/utils/generateContract';
	import ReservedSeat from './reservedSeat.svelte';
	import moment from 'moment';
	import { LanguageEnum } from '../../../../../models/languageEnum';
	import { convertNumberToWord } from '$lib/utils/numberToWordLang';
	import { browser } from '$app/environment';
	import { addNewToast } from '../../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../../models/toastTypeEnum';

	export let data;
	let loadedTotalPrice = false;
	let loading = false;
	let languages = Object.values(LanguageEnum);
	let discountedPrice = 0;
	let total_price = 0;

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
		created_at: Date;
		reserved_areas?: string;
		type: SeatsLayoutTypeEnum;
		extra_discount_checked?: boolean;
		rejected_by_user?: boolean;
	}
	let openPreviewImage = false;
	let selectedImageUrlForPreview = '';
	let objectId = $page.params.reserveId;
	let seatLayout: undefined | any[] = undefined;
	let extraDiscountChecked = false;
	let reservations: any[] = [];
	let reservedSeatData: any = [];
	let exhibitionId = 0;

	onMount(async () => {
		objectId = $page.params.reserveId;
		getReservationData();
		await data.supabase
			.from('seat_reservation')
			.update({
				new_edit: false
			})
			.eq('object_id', objectId);
	});

	async function getReservationData() {
		loading = true;
		await data.supabase
			.from('seat_reservation')
			.select('*,company(*),exhibition(*,exhibition_languages(*))')
			.eq('object_id', objectId)
			.then(async (Response) => {
				total_price = Response?.data[0]?.total_price;
				reservations = Response.data as reservationType[];
				reservedSeatData = JSON.parse(reservations[0]?.reserved_areas ?? '[]');
				if (reservations[0]?.type != SeatsLayoutTypeEnum.AREAFIELDS) {
					await getSeatLayout();
				}
				exhibitionId = reservations[0]?.exhibition?.id ?? 0;
				calculateTotalPrice();
			});
		loading = false;
	}

	async function getSeatLayout() {
		const response = await data.supabase
			.from('exhibition')
			.select('*,seat_layout(*)', { count: 'exact' })
			.eq('id', reservations[0]?.exhibition_id)
			.single();

		seatLayout = response?.data?.seat_layout;
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

	// Function to determine if a checkbox should be disabled based on the current reservation status
	let key = 0;
	function isCheckboxDisabled(
		currentStatus: ReservationStatusEnum,
		checkboxStatus: ReservationStatusEnum
	) {
		if (
			(currentStatus === ReservationStatusEnum.ACCEPT ||
				currentStatus === ReservationStatusEnum.REJECT) &&
			currentStatus !== checkboxStatus
		) {
			return true;
		}
		return false;
	}

	async function updateStatus(itemID?: number, selectedStatus?: string, reservationData?: any) {
		loading = true;

		if (itemID == undefined || selectedStatus == undefined) return;

		if (selectedStatus == ReservationStatusEnum.ACCEPT) {
			// Check if updating service quantity is allowed
			const quantityCheck = await updateServiceQuantity();
			if (!quantityCheck.updateAllowed) {
				addNewToast({
					type: ToastTypeEnum.ERROR,
					message: quantityCheck.message,
					title: 'Error',
					duration: 3000
				});
				return;
			}
		}

		// Fetch the active seat data
		let seatLayoutDataResponse = await data.supabase
			.from('seat_layout')
			.select('*')
			.eq('is_active', true);

		// checkbox
		reservations[0].status = selectedStatus;
		key++;

		// Proceed to update the status if quantity check passes
		let response = await data.supabase
			.from('seat_reservation')
			.update({ status: selectedStatus })
			.eq('id', itemID);

		if (response.error) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Failed to update reservation status.',
				title: 'Update Error',
				duration: 3000
			});
		} else {
			if (selectedStatus == ReservationStatusEnum.REJECT) {
				let activeSeat = seatLayout?.find((seat) => seat.is_active == true);
				let seatAreasData = JSON.parse(activeSeat?.areas);
				if (reservationData?.reserved_areas) {
					let userReservedAreas = JSON.parse(reservationData?.reserved_areas);
					console.log(userReservedAreas);
					userReservedAreas.map((userReservedArea: any) => {
						if (seatAreasData) {
							let areaIndex = seatAreasData.findIndex(
								(area: any) => area.area == userReservedArea.area
							);
							seatAreasData[areaIndex].quantity =
								seatAreasData[areaIndex]?.quantity + userReservedArea.quantity;
						}
					});
				}
				await data.supabase
					.from('seat_layout')
					.update({
						areas: JSON.stringify(seatAreasData)
					})
					.eq('id', activeSeat.id)
					.then(() => {
						getReservationData();
					});
			}
			reservations.map(async (reserveData) => {
				if (reserveData.status == ReservationStatusEnum.PENDING) return;
				reserveData.status = selectedStatus as any;

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
	}
	////////////////////////////////////////////////////////////////////////////
	// update quantity

	async function updateServiceQuantity() {
		let result = { updateAllowed: true, message: '' };

		for (const reservation of reservations) {
			if (Array.isArray(reservation.services)) {
				for (const serviceString of reservation.services) {
					try {
						const service = JSON.parse(serviceString);
						const serviceName = service.serviceDetail.languages[0].title;

						const { data: serviceDetails, error } = await data.supabase
							.from('seat_services')
							.select('quantity')
							.eq('id', service.serviceId)
							.single();

						if (error || !serviceDetails) {
							result = {
								updateAllowed: false,
								message: `Error fetching details for "${serviceName}" or service not found`
							};
							break;
						}

						const newQuantity = serviceDetails.quantity - service.quantity;
						if (newQuantity < 0) {
							// Include the service name in the error message
							result = {
								updateAllowed: false,
								message: `Unable to reduce the quantity for '${serviceName}'. To proceed, you can either:- Increase the quantity available for this service, or
- Advise the user to reduce their requested quantity.
After adjusting the quantities accordingly, you may attempt to accept the reservation again.`
							};
							break;
						} else {
							// Proceed to update the seat_services table since the new quantity is >= 0
							const { error: updateError } = await data.supabase
								.from('seat_services')
								.update({ quantity: newQuantity })
								.eq('id', service.serviceId);

							if (updateError) {
								result = {
									updateAllowed: false,
									message: `Error updating quantity for "${serviceName}": ${updateError.message}`
								};
								break;
							}
						}
					} catch (e) {
						result = {
							updateAllowed: false,
							message: `Error processing for this service `
						};
						break;
					}
				}
			} else {
				result = {
					updateAllowed: false,
					message: 'Invalid format for reservation.services, expected an array.'
				};
				break;
			}
			if (!result.updateAllowed) break;
		}

		return result;
	}

	////////////////////////////////////////////////////

	// allow to update status
	let isEditing = false;
	function toggleEdit() {
		isEditing = !isEditing;
	}

	let totalAreaPrice = 0;
	let totalArea = 0;
	let totalRawPrice = 0;
	let pricePerMeter = 0;

	let reservedAreas: any = [];

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
			id: reservationData.company_id,
			email: reservationData.company?.email,
			pricePerMeter,
			totalArea,
			totalRawPrice,
			totalAreaPrice,
			totalPriceText: convertNumberToWord(totalAreaPrice, lang),
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
			.from('seat_layout')
			.select('*')
			.eq('exhibition', exhibitionId)
			.eq('is_active', true)
			.single()
			.then((response) => {
				if (response.data) {
					pricePerMeter = response.data.price_per_meter;
					if (extraDiscountChecked) {
						discountedPrice = response.data.extra_discount;
					} else {
						discountedPrice = response.data.discounted_price;
					}
				}
			});
		reservedAreas = reservedSeatData?.map((data: any) => {
			let result = {
				id: data.id++,
				area: data.area,
				quantity: data.quantity,
				pricePerMeter: pricePerMeter,
				totalAreaPrice: data.quantity * pricePerMeter * +data.area,
				discountedPrice: +data.area * (discountedPrice ?? pricePerMeter)
			};
			return result;
		});
		reservedAreas.map((seatArea: any) => {
			totalArea += +seatArea.area * +seatArea.quantity;
			totalAreaPrice += +seatArea.quantity * +(discountedPrice ?? pricePerMeter) * +seatArea.area;
			totalRawPrice += +seatArea.quantity * pricePerMeter * +seatArea.area;
		});
		loadedTotalPrice = true;
	}
	function getServices(service: string) {
		return JSON.parse(service ?? '');
	}
	function exportFile(reservation: any) {
		window.open(
			import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_FILE_URL + '/' + reservation?.file_url
		);
	}

	function goBackToPreviewsPage() {
		if (browser) {
			window.history.back();
		}
	}
</script>

<Modal bind:open={openPreviewImage} autoclose outsideclose>
	<!-- svelte-ignore a11y-missing-attribute -->
	<img src={selectedImageUrlForPreview} class="rounded-lg w-full h-full min-w-[150px] pt-8" />
</Modal>

<!-- content  -->
<div
	class="w-full flex flex-col py-32 items-center"
	style="min-height: calc(100vh - 80px); flex-direction: column;"
>
	<div class="w-full lg:w-9/12">
		<!-- Title (BreadCrumb) -->
		<div class="flex justify-start items-start mb-5">
			<Breadcrumb aria-label="Solid background breadcrumb example">
				<BreadcrumbItem>
					<svelte:fragment slot="icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-4 h-4 -mr-2"
						>
							<path
								fill-rule="evenodd"
								d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
								clip-rule="evenodd"
							/>
						</svg>
					</svelte:fragment>
				</BreadcrumbItem>
				<button on:click={goBackToPreviewsPage}>List of Reservations </button>
				<BreadcrumbItem>
					<svelte:fragment slot="icon"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-4 h-4"
						>
							<path
								fill-rule="evenodd"
								d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
								clip-rule="evenodd"
							/>
						</svg>
					</svelte:fragment>
					<span class="text-gray-500 dark:text-gray-400">
						{reservations[0]?.exhibition?.exhibition_type}
					</span>
				</BreadcrumbItem>
			</Breadcrumb>
		</div>
		<div class="w-full overflow-x-auto">
			<table class="min-w-full border-collapse">
				<thead>
					<tr>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">reservation date</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">company name</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">avatar</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">country</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">passport images</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">user images</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">comment</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">company address</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">company phone number</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">exhibition type</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">reserved areas</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">services</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2 mx-[50px] uppercase">change status</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex flex-col items-center gap-2 justify-between">
								extra discount check status
							</div></th
						>
						<th class="table_header dark:border-gray-800">
							<div class="flex flex-col items-center gap-2 justify-between">contract file</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2">export excel sheet</div>
						</th>
						<th class="table_header dark:border-gray-800">
							<div class="flex items-center gap-2">total price</div>
						</th>
					</tr>
				</thead>
				<!-- comment -->
				<tbody class="dark:text-gray-300">
					{#each reservations as reservation}
						<tr class="border-2 border-[#edeff2]">
							<td class="max-w-sm px-4">
								<span
									class="p-2 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 rounded-lg text-gray-900 text-sm border"
								>
									{#if reservation.created_at}
										{moment
											.utc(reservation.created_at)
											.local()
											.format('DD-MM-YYYY hh:mm A')
											.toString()}
									{:else}
										does not exist
									{/if}
								</span>
							</td>

							<td class="">
								<div>{reservation.company?.company_name}</div>
							</td>

							<td>
								<div class="min-w-[100px] flex justify-center">
									{#if reservation.company?.logo_url}
										<img
											src="{import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/{reservation.company
												?.logo_url}"
											alt=""
											class="rounded-full w-16 h-16 m-3"
										/>
									{/if}
								</div>
							</td>
							<td>
								<div>
									{reservation?.company?.country}
								</div>
							</td>
							<td>
								<div class="min-w-[100px] flex justify-center mx-2">
									{#if reservation.company?.passport_image}
										{#each reservation.company?.passport_image as image}
											<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
											<!-- svelte-ignore a11y-click-events-have-key-events -->
											<img
												src="{import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/{image}"
												alt=""
												class="rounded-lg w-full h-32 min-w-[150px] object-cover cursor-pointer"
												on:click={() => {
													openPreviewImage = true;
													selectedImageUrlForPreview =
														import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL + '/' + image;
												}}
											/>
											<br />
										{/each}
									{/if}
								</div>
							</td>
							<td>
								<div class="min-w-[100px] flex justify-center mx-2">
									{#if reservation.company?.user_image}
										<!-- {#each reservation.company?.user_image as image} -->
										<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										{#each reservation.company?.user_image as image}
											<img
												src="{import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/{image}"
												alt=""
												class="rounded-lg w-full h-32 min-w-[150px] object-cover cursor-pointer"
												on:click={() => {
													openPreviewImage = true;
													selectedImageUrlForPreview =
														import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL + '/' + image;
												}}
											/>
											<br />
											<!-- {/each} -->
										{/each}
									{/if}
								</div>
							</td>

							<td>
								<div>{reservation.comment}</div>
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

								<div
									class="flex flex-col border-t-2 border-[#696868] border-dashed justify-center items-center"
								>
									{totalAreaPrice}
								</div>
							</td>
							<td>
								<div>
									{#if reservation?.services}
										{#each reservation?.services as service}
											<div
												class="flex flex-col border-b-2 border-[#696868] border-dashed justify-center items-center"
											>
												<h3>
													service name : {getServices(service)?.serviceDetail?.languages[0]?.title}
												</h3>
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
								<div
									class="flex flex-col justify-start items-start space-y-2 mx-2 cursor-pointer
								"
								>
									<label for="" class="text-sm text-gray-400">
										Please, Once you change the status, it cannot be altered.
									</label>
									<p class="mx-2">{reservation.rejected_by_user ? 'Rejected by user' : ''}</p>

									<label class="flex items-center space-x-2">
										<input
											disabled={isCheckboxDisabled(
												reservation.status,
												ReservationStatusEnum.PENDING
											)}
											type="checkbox"
											checked={reservation.status === ReservationStatusEnum.PENDING}
											on:change={() =>
												updateStatus(reservation?.id, ReservationStatusEnum.PENDING, reservation)}
											class="w-5 h-5 form-checkbox rounded border-yellow-400 text-yellow-400"
										/>
										<span class="text-yellow-400 uppercase">{ReservationStatusEnum.PENDING}</span>
									</label>

									<label class="flex items-center space-x-2">
										<input
											disabled={isCheckboxDisabled(
												reservation.status,
												ReservationStatusEnum.ACCEPT
											) ||
												reservation.status == ReservationStatusEnum.ACCEPT ||
												reservation.status == ReservationStatusEnum.REJECT}
											type="checkbox"
											checked={reservation.status === ReservationStatusEnum.ACCEPT}
											on:change={() =>
												updateStatus(reservation?.id, ReservationStatusEnum.ACCEPT, reservation)}
											class="w-5 h-5 form-checkbox rounded border-green-400 text-green-400"
										/>
										<span class="text-green-400 uppercase">{ReservationStatusEnum.ACCEPT}</span>
									</label>

									<label class="flex items-center space-x-2">
										<input
											disabled={isCheckboxDisabled(
												reservation.status,
												ReservationStatusEnum.REJECT
											) ||
												reservation.status == ReservationStatusEnum.ACCEPT ||
												reservation.status == ReservationStatusEnum.REJECT}
											type="checkbox"
											checked={reservation.status === ReservationStatusEnum.REJECT}
											on:change={() =>
												updateStatus(reservation?.id, ReservationStatusEnum.REJECT, reservation)}
											class="w-5 h-5 form-checkbox rounded border-red-400 text-red-400"
										/>
										<span class="text-red-400 uppercase">{ReservationStatusEnum.REJECT}</span>
									</label>
								</div>
							</td>

							<td>
								<div class="w-full flex justify-center">
									<div
										class="min-w-[80px] h-[50px] flex justify-center items-center rounded-xl p-3"
										style=" {reservation.extra_discount_checked
											? 'background-color: #00bf2d;color:white'
											: 'background-color:#edeff2'};"
									>
										{reservation.extra_discount_checked ? 'checked' : 'not checked'}
									</div>
								</div>
							</td>
							<td>
								{#each languages as lang}
									<Button
										disabled={!loadedTotalPrice}
										class="m-2"
										on:click={() => exportContract(reservation, lang)}>export {lang}</Button
									>
								{/each}
							</td>
							<td>
								<Button class="mx-2" on:click={() => exportFile(reservation)} disabled={loading}
									>download</Button
								>
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
										{total_price}$
									</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if seatLayout}
			<ReservedSeat data={seatLayout} {reservations} />
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
	td {
		/* background-color: red; */
		border: 2px solid #edeff2;
		text-align: center;
	}
	/* td div {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 0 30px;
	} */
</style>
