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
	import * as XLSX from 'xlsx';  
	import Spinner from '$lib/components/Spinner.svelte';  

	export let data;
	let loadedTotalPrice = false;
	let loading = false;
	let languages = Object.values(LanguageEnum);
	let discountedPrice = 0;

	interface reservationType {
		id?: number;
		exhibition_id?: number;
		object_id?: number;
		comment?: string[] | string;  
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
		total_price: number;
		file_url?: string;  
	}
	let openPreviewImage = false;
	let selectedImageUrlForPreview = '';
	let objectId = $page.params.reserveId;
	let seatLayout: undefined | any[] = undefined;
	let extraDiscountChecked = false;
	let reservations: reservationType[] = [];  
	let reservedSeatData: any = [];
	let exhibitionId = 0;

	onMount(async () => {
		objectId = $page.params.reserveId;
		await getReservationData();
		await data.supabase
			.from('seat_reservation')
			.update({
				new_edit: false
			})
			.eq('object_id', objectId);
	});

	let disableCheckbox: boolean = false;

	async function getReservationData() {
		loading = true;
		const response = await data.supabase
			.from('seat_reservation')
			.select('*,company(*),exhibition(*,exhibition_languages(*))')
			.eq('object_id', objectId);

		if (response.error) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Failed to fetch reservations.',
				title: 'Error',
				duration: 3000
			});
			loading = false;
			return;
		}

		reservations = response.data as reservationType[];
		reservedSeatData = JSON.parse(reservations[0]?.reserved_areas ?? '[]');

		// Set disableCheckbox to true if any reservation has status 'accept'
		disableCheckbox = reservations.some((reservation) => reservation.status === 'accept');

		if (reservations[0]?.type !== SeatsLayoutTypeEnum.AREAFIELDS) {
			await getSeatLayout();
		}
		exhibitionId = reservations[0]?.exhibition?.id ?? 0;
		await calculateTotalPrice();
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
		if (lang === LanguageEnum.EN) {
			switch (status) {
				case ReservationStatusEnum.ACCEPT:
					result = 'This reservation is accepted by admin';
					break;
				case ReservationStatusEnum.REJECT:
					result = 'This reservation is rejected by admin';
					break;
				default:
					result = 'Pending';
			}
		} else if (lang === LanguageEnum.CKB) {
			switch (status) {
				case ReservationStatusEnum.ACCEPT:
					result = 'داواکاری شوێنگرتن وەرگیرا';
					break;
				case ReservationStatusEnum.REJECT:
					result = 'داواکاری شوێنگرتن ڕەتکرایەوە';
					break;
				default:
					result = 'لەدەرچوون';
			}
		} else if (lang === LanguageEnum.AR) {
			switch (status) {
				case ReservationStatusEnum.ACCEPT:
					result = 'قبلت';
					break;
				case ReservationStatusEnum.REJECT:
					result = 'مرفوض';
					break;
				default:
					result = 'قيد الانتظار';
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
					(exhibitionLanguage: any) => exhibitionLanguage.language === lang
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
		reservation: reservationType,
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

	async function updateStatus(itemID?: number, selectedStatus?: ReservationStatusEnum, reservationData?: reservationType) {
		if (itemID == undefined || selectedStatus == undefined) return;

		if (selectedStatus === ReservationStatusEnum.ACCEPT) {
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

		loading = true;

		// Update the status in the local state
		reservations = reservations.map((reservation) => {
			if (reservation.id === itemID) {
				return { ...reservation, status: selectedStatus };
			}
			return reservation;
		});
		key++;

		// Proceed to update the status in the database
		const response = await data.supabase
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
			if (selectedStatus === ReservationStatusEnum.REJECT) {

				let activeSeat = seatLayout?.find((seat) => seat.is_active === true);

				let seatAreasData = JSON.parse(activeSeat?.areas ?? '[]');

				if (reservationData?.reserved_areas) {
					let userReservedAreas = JSON.parse(reservationData.reserved_areas);

					userReservedAreas.forEach((userReservedArea: any) => {
						if (seatAreasData) {
							let areaIndex = seatAreasData.findIndex(
								(area: any) => area.area === userReservedArea.area
							);
							if (areaIndex !== -1) {
								seatAreasData[areaIndex].quantity += userReservedArea.quantity;
							}
						}
					});
				}


				try {
					await data.supabase
						.from('seat_layout')
						.update({
							areas: JSON.stringify(seatAreasData)
						})
						.eq('id', activeSeat?.id);
					
					getReservationData();
				} catch (error) {
					// console.error('Error updating seat layout:', error);
				}
			}

			// Insert notifications
			await Promise.all(
				reservations.map(async (reserveData) => {
					if (reserveData.status === ReservationStatusEnum.PENDING) return;
					reserveData.status = selectedStatus;

					await data.supabase
						.from('notification')
						.insert([
							addNotificationData(reserveData, LanguageEnum.EN),
							addNotificationData(reserveData, LanguageEnum.CKB),
							addNotificationData(reserveData, LanguageEnum.AR)
						]);
				})
			);
		}
		await getReservationData();
	}

	////////////////////////////////////////////////////////////////////////////
	// Update quantity data
	async function updateServiceQuantity() {
		let result = { updateAllowed: true, message: '' };
		let updates = [];

		// Aggregate necessary updates
		for (const reservation of reservations) {
			if (Array.isArray(reservation.services)) {
				for (const serviceString of reservation.services) {
					try {
						const service = JSON.parse(serviceString);
						const { data: serviceDetails, error } = await data.supabase
							.from('seat_services')
							.select('quantity')
							.eq('id', service.serviceId)
							.single();

						if (error || !serviceDetails) {
							return {
								updateAllowed: false,
								message: `Error fetching service details or service not found.`
							};
						}

						const newQuantity = serviceDetails.quantity - service.quantity;
						if (newQuantity < 0) {
							return {
								updateAllowed: false,
								message: `Insufficient quantity for service.`
							};
						}

						// Instead of updating here, add to updates array
						updates.push({ serviceId: service.serviceId, newQuantity });
					} catch (e) {
						return {
							updateAllowed: false,
							message: `Error processing service update.`
						};
					}
				}
			} else {
				return {
					updateAllowed: false,
					message: 'Invalid service data format.'
				};
			}
		}

		// Execute all updates sequentially
		for (let update of updates) {
			const { error } = await data.supabase
				.from('seat_services')
				.update({ quantity: update.newQuantity })
				.eq('id', update.serviceId);

			if (error) {
				return {
					updateAllowed: false,
					message: `Failed to update service quantity.`
				};
			}
		}

		return result;
	}

	////////////////////////////////////////////////////

	// Allow to update status
	let isEditing = false;
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
		const response = await data.supabase
			.from('contract_decode_files')
			.select('*')
			.eq('exhibition_id', exhibitionId)
			.eq('language', lang);

		if (response.error || response.data.length === 0) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Failed to fetch contract template.',
				title: 'Export Error',
				duration: 3000
			});
			return;
		}

		generateDocx(response.data[0].decoded_file, docxData);
	}

	async function calculateTotalPrice() {
		const response = await data.supabase
			.from('seat_layout')
			.select('*')
			.eq('exhibition', exhibitionId)
			.eq('is_active', true)
			.single();

		if (response.data) {
			pricePerMeter = response.data.price_per_meter;
			if (extraDiscountChecked) {
				discountedPrice = response.data.extra_discount;
			} else {
				discountedPrice = response.data.discounted_price;
			}
		}

		reservedAreas = reservedSeatData?.map((data: any) => {
			let result = {
				id: data.id++, // Be cautious with auto-incrementing IDs
				area: data.area,
				quantity: data.quantity,
				pricePerMeter: pricePerMeter,
				totalAreaPrice: data.quantity * pricePerMeter * +data.area,
				discountedPrice: +data.area * (discountedPrice ?? pricePerMeter)
			};
			return result;
		});

		reservedAreas.forEach((seatArea: any) => {
			totalArea += +seatArea.area * +seatArea.quantity;
			totalAreaPrice += +seatArea.quantity * (discountedPrice ?? pricePerMeter) * +seatArea.area;
			totalRawPrice += +seatArea.quantity * pricePerMeter * +seatArea.area;
		});

		loadedTotalPrice = true;
	}

	function getServices(service: string) {
	  try {
			return JSON.parse(service ?? '');
		} catch (e) {
			return null;
		}
	}
	

	function exportFile(reservation: reservationType) {
		if (!reservation) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Reservation data is unavailable.',
				title: 'Export Error',
				duration: 3000
			});
			return;
		}

		// Prepare data for Excel
		const dataToExport = [
			{
				'Reservation Date': reservation.created_at
					? moment.utc(reservation.created_at).local().format('DD-MM-YYYY hh:mm A')
					: 'N/A',
				'Company Name': reservation.company?.company_name || 'N/A',
				Country: reservation.company?.country || 'N/A',
				Comment: Array.isArray(reservation.comment)
					? reservation.comment.join(', ')
					: reservation.comment || 'No Comment',
				'Company Address': reservation.company?.address || 'N/A',
				'Company Phone Number': reservation.company?.phone_number || 'N/A',
				'Exhibition Type': reservation.exhibition?.exhibition_type || 'N/A',
				'Total Price': reservation.total_price ? `${reservation.total_price}$` : 'N/A'
			}
		];

		// Create a new workbook and add the data
		const worksheet = XLSX.utils.json_to_sheet(dataToExport);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservation');

		// Generate Excel file and trigger download
		XLSX.writeFile(workbook, `Reservation_${reservation.id}.xlsx`);

		// Optional: Notify the user of a successful export
		addNewToast({
			type: ToastTypeEnum.SUCCESS,
			message: 'Excel file exported successfully.',
			title: 'Export Success',
			duration: 3000
		});
	}

	function exportOriginalFile(reservation: reservationType) {
		if (reservation.file_url) {
			window.open(`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_FILE_URL}/${reservation.file_url}`, '_blank');
		} else {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'No file available for download.',
				title: 'Download Error',
				duration: 3000
			});
		}
	}

	function goBackToPreviewsPage() {
		if (browser) {
			window.history.back();
		}
	}
</script>

<!-- Modal Component -->
<Modal bind:open={openPreviewImage} autoclose={true} outsideclose={true} aria-labelledby="preview-modal-title">
	<div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
	 	<img src={selectedImageUrlForPreview} alt="Preview Image" class="rounded w-full h-full object-contain" />
	</div>
</Modal>

<!-- Loading Spinner Component -->
{#if loading}
	<div class="flex justify-center items-center h-screen">
		<Spinner size="h-16 w-16" color="border-gray-500" />  
	</div>
{:else}
	<!-- Content -->
	<div
		class="w-full flex flex-col py-16 md:py-32 items-center"
		style="min-height: calc(100vh - 80px); flex-direction: column;"
	>
		<div class="w-full lg:w-10/12 xl:w-9/12">
			<!-- Breadcrumb -->
			<div class="flex justify-start items-center mb-6 text-gray-600 dark:text-gray-300">
				<Breadcrumb aria-label="Breadcrumb">
					<BreadcrumbItem>
						<svelte:fragment slot="icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 -mr-2">
								<path
									fill-rule="evenodd"
									d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</svelte:fragment>
					</BreadcrumbItem>
					<button on:click={goBackToPreviewsPage}>
						List of Reservations
					</button>
					<BreadcrumbItem>
						<svelte:fragment slot="icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
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

			<!-- Table Container -->
			<div class="overflow-x-auto shadow-md rounded-lg custom-scrollbar">
				<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 ">
					<thead>
					 <tr  class="p-3 font-semibold uppercase bg-[#f1eff0] text-gray-600 text-sm border border-gray-200 dark:border-gray-800">
							<th class=" ">
								Reservation Date
							</th>
							<th class=" ">
								Company Name
							</th>
							<th class=" ">
								Avatar
							</th>
							<th class=" ">
								Country
							</th>
							<th class=" ">
								Passport Images
							</th>
							<th class=" ">
								User Images
							</th>
							<th class=" ">
								Comment
							</th>
							<th class=" ">
								Company Address
							</th>
							<th class=" ">
								Company Phone Number
							</th>
							<th class=" ">
								Exhibition Type
							</th>
							{#if reservations[0]?.type === SeatsLayoutTypeEnum.AREAFIELDS}
								<th class=" ">
									Reserved Areas
								</th>
							{/if}
							<th class=" ">
								Services
							</th>
							<th class=" ">
								Change Status
							</th>
							<th class=" ">
								Extra Discount
							</th>
							<th class=" ">
								Contract File
							</th>
							<th class=" ">
								Export Excel Sheet
							</th>
							<th class=" ">
								Total Price
							</th>
						</tr>
					</thead>
					<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
						{#each reservations as reservation}
							<tr class="bg-gray-100 dark:bg-gray-900 even:bg-gray-200 dark:even:bg-gray-800 transition-colors duration-200">
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									<span class="inline-block p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-900 dark:text-gray-100 text-xs md:text-sm">
										{#if reservation.created_at}
											{moment.utc(reservation.created_at).local().format('DD-MM-YYYY hh:mm A')}
										{:else}
											<span class="text-red-500">N/A</span>
										{/if}
									</span>
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									{reservation.company?.company_name}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-center">
									{#if reservation.company?.logo_url}
										<img
											src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${reservation.company.logo_url}`}
											alt="Company Logo"
											class="mx-auto h-16 w-16 rounded-full object-cover"
										/>
									{:else}
										<span class="text-gray-500">No Image</span>
									{/if}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									{reservation.company?.country}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-center">
									{#if reservation.company?.passport_image}
										<div class="flex flex-wrap justify-center gap-2">
											{#each reservation.company.passport_image as image}
												<img
													src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`}
													alt="Passport Image"
													class="h-20 w-20 object-cover rounded cursor-pointer"
													on:click={() => {
														openPreviewImage = true;
														selectedImageUrlForPreview = `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`;
													}}
												/>
											{/each}
										</div>
									{:else}
										<span class="text-gray-500">No Images</span>
									{/if}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-center">
									{#if reservation.company?.user_image}
										<div class="flex flex-wrap justify-center gap-2">
											{#each reservation.company.user_image as image}
												<img
													src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`}
													alt="User Image"
													class="h-20 w-20 object-cover rounded cursor-pointer"
													on:click={() => {
														openPreviewImage = true;
														selectedImageUrlForPreview = `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`;
													}}
												/>
											{/each}
										</div>
									{:else}
										<span class="text-gray-500">No Images</span>
									{/if}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									{Array.isArray(reservation.comment)
										? reservation.comment.join(', ')
										: reservation.comment || 'No Comment'}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									{reservation.company?.address}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									{reservation.company?.phone_number}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									{reservation.exhibition?.exhibition_type}
								</td>

								 
								{#if reservations[0]?.type === SeatsLayoutTypeEnum.AREAFIELDS}
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									<div>
										{#if reservation?.reserved_areas}
											<div class="space-y-1">
												{#each JSON.parse(reservation.reserved_areas) as reservedAreaData}
													<div class="flex justify-between p-2 bg-gray-200 dark:bg-gray-700 rounded">
														<span>{reservedAreaData.area} M</span>
														<span>{reservedAreaData.quantity}</span>
													</div>
												{/each}
											</div>
										{/if}
										<div class="mt-2 font-semibold text-gray-800 dark:text-gray-200">
											Total: {totalAreaPrice}$
										</div>
									</div>
								</td>
							{/if}
							
                              

								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
									{#if reservation?.services && reservation.services.length > 0}
										<div class="space-y-2">
											{#each reservation.services as service}
												<div class="p-2 border rounded bg-gray-50 dark:bg-gray-800">
													<p><strong>Service Name:</strong> 
														{#if reservations[0]?.type === SeatsLayoutTypeEnum.AREAFIELDS}
														{getServices(service)?.serviceDetail?.languages[0]?.title}
													{:else}
														{getServices(service)?.serviceDetail?.title}
													{/if}
</p>
													<p><strong>Quantity:</strong> {getServices(service)?.quantity || 0}</p>
													<p><strong>Price:</strong> {getServices(service)?.serviceDetail?.price || 0}$</p>
													<p><strong>Discount:</strong> {getServices(service)?.serviceDetail?.discount || 0}%</p>
													<p><strong>Total:</strong> {getServices(service)?.totalPrice || 0 }$</p>
												</div>
											{/each}
										</div>
									{:else}
										<span class="text-gray-500">No Services</span>
									{/if}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<div class="flex flex-col space-y-2">
										<label class="text-xs text-gray-500 dark:text-gray-400">
											Once you change the status, it cannot be altered.
										</label>
										<div class="flex items-center space-x-4">
											<label class="flex items-center space-x-1">
												<input
													type="checkbox"
													disabled={isCheckboxDisabled(reservation, reservation.status, ReservationStatusEnum.PENDING)}
													checked={reservation.status === ReservationStatusEnum.PENDING}
													on:change={() => updateStatus(reservation.id, ReservationStatusEnum.PENDING, reservation)}
													class="form-checkbox h-4 w-4 text-yellow-500 border-gray-300 rounded"
												/>
												<span class="text-yellow-500">Pending</span>
											</label>
											<label class="flex items-center space-x-1">
												<input
													type="checkbox"
													disabled={
														isCheckboxDisabled(reservation, reservation.status, ReservationStatusEnum.ACCEPT) ||
														disableCheckbox
													}
													checked={reservation.status === ReservationStatusEnum.ACCEPT}
													on:change={() => updateStatus(reservation.id, ReservationStatusEnum.ACCEPT, reservation)}
													class="form-checkbox h-4 w-4 text-green-500 border-gray-300 rounded"
												/>
												<span class="text-green-500">Accept</span>
											</label>
											<label class="flex items-center space-x-1">
												<input
													type="checkbox"
													disabled={
														isCheckboxDisabled(reservation, reservation.status, ReservationStatusEnum.REJECT) ||
														disableCheckbox
													}
													checked={reservation.status === ReservationStatusEnum.REJECT}
													on:change={() => updateStatus(reservation.id, ReservationStatusEnum.REJECT, reservation)}
													class="form-checkbox h-4 w-4 text-red-500 border-gray-300 rounded"
												/>
												<span class="text-red-500">Reject</span>
											</label>
										</div>
										{#if reservation.rejected_by_user}
											<p class="text-xs text-red-500 mt-1">Rejected by user</p>
										{/if}
									</div>
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-center">
									<span
										class={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
											reservation.extra_discount_checked
												? 'bg-green-500 text-white'
												: 'bg-gray-300 text-gray-700'
										}`}
									>
										{reservation.extra_discount_checked ? 'Checked' : 'Not Checked'}
									</span>
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-center">
									{#each languages as lang}
										<Button
											disabled={!loadedTotalPrice}
											class="m-1 text-xs px-3 py-1"
											color="primary"
											on:click={() => exportContract(reservation, lang)}
										>
											Export {lang}
										</Button>
									{/each}
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-center">
									<button
										class="text-xs px-3 py-1 hover:underline text-gray-600 dark:text-gray-300"
										on:click={() => exportFile(reservation)}
										disabled={loading}
									 	>
										Export to Excel
								</button>
								</td>

								<td class="px-6 py-4 whitespace-nowrap text-center text-sm">
									<div>
										{#if discountedPrice}
											<p class="line-through text-xs text-red-500">
												{totalRawPrice}$
											</p>
										{/if}
										<p class="text-green-600 font-medium">
											{reservation.total_price}$
										</p>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Reserved Seats Layout -->
			<div class="mt-6">
				{#if seatLayout}
					<ReservedSeat data={seatLayout} {reservations} />
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Enhanced Table Styles */
	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		text-align: left;
		padding: 0.75rem;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		th,
		td {
			padding: 0.5rem;
		}
	}

	
	/* Adjust modal image for better responsiveness */
	Modal img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	/* Custom Scrollbar Styles */
	.custom-scrollbar::-webkit-scrollbar {
		height: 8px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}

	/* Firefox */
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: #888 #f1f1f1;
	}

	 
</style>
