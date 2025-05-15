<script lang="ts">
	import { PencilSquare, Trash } from 'svelte-heros-v2';
	import {
		Input,
		Label,
		Button,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		ButtonGroup,
		InputAddon,
		Chevron,
		Dropdown,
		DropdownItem,
		Tabs,
		TabItem,
		Textarea,
		Spinner,
		Fileupload,
		Modal,
		Checkbox
	} from 'flowbite-svelte';
	import type { ExhibitionsModel } from '../../../../../models/exhibitionModel';
	import { exhibitions, getData } from '../../../../../stores/exhibitionStore';
	import { SeatServiceStatusEnum } from '../../../../../models/seatServiceStatusEnum';
	import { LanguageEnum } from '../../../../../models/languageEnum';
	import type { SeatPrivacyPolicyModel } from '../../../../../models/addSeatDataModel';
	import { addNewToast } from '../../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../../models/toastTypeEnum';
	import { onMount } from 'svelte';
	import RequiredFieldsComponent from '../requiredFields.svelte';
	import { SeatsLayoutTypeEnum } from '../../../../../models/seatsLayoutTypeEnum';
	import { page } from '$app/stores';
	import UploadContractFile from '../uploadContractFile.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import type { PageData } from '../$types';
	import { goto } from '$app/navigation';
	import { IconArrowLeft } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data: PageData;
	interface areaType {
		area: string;
		quantity: number;
	}
	interface serviceType {
		id: number;
		serviceId: number;
		maxFreeCount: number;
		maxQuantityPerUser: number;
		unlimitedFree: boolean;
		title: string;
		selected: boolean;
	}

	let excelFilePreviewSelected: File;

	let seatInfoData: {
		exhibition?: ExhibitionsModel;
		name: string;
		isActive?: boolean;
		is_excel_required?: boolean;
		privacy_policy?: string;
		price_per_meter?: number;
		discounted_price?: number;
		extra_discount?: number;
		price_sign?: string;
		description_seat?: string;
	} = {
		exhibition: undefined,
		name: '',
		isActive: undefined
	};

	let excel_preview_url = '';
	let isOpenEditModal = false;
	let loading = false;
	let serviceStatus = (
		Object.keys(SeatServiceStatusEnum) as Array<keyof typeof SeatServiceStatusEnum>
	).map((key) => SeatServiceStatusEnum[key]);

	let languageEnumKeys: string[] = Object.values(LanguageEnum);

	let formSubmitted = false;
	let dropdownOpen = false;
	let isActiveDropdownOpen = false;
	let areas: areaType[] = [];
	let seatServices: serviceType[] = [];
	let showModal = false;
	let privacyPolicyLang: SeatPrivacyPolicyModel[] = [];

	let existingServices: serviceType[] = [];

	let newArea: areaType = {
		area: '',
		quantity: 0
	};

	onMount(async () => {
		await getData(data.supabase);
		await getSeatDetail();
	});

	// return all services as Array of objects
	onMount(async () => {
		const response = await data.supabase
			.from('seat_services')
			.select('*, seat_services_languages(*)')
			.order('position', { ascending: true });

		seatServices = response?.data?.map((service) => ({
			serviceId: service.id,
			id: service.id,
			title:
				service.seat_services_languages.find((lang: { language: string }) => lang.language === 'en')?.title || 'No title',
			selected: false,
			quantity: 0,
			maxFreeCount: 0,
			unlimitedFree: false
		})) || [];  
	});

	async function getSeatDetail() {
		await data.supabase
			.from('seat_layout')
			.select('*,exhibition(*,exhibition_languages(*)),seat_privacy_policy_lang(*)')
			.eq('id', $page.params.reservationId)
			.single()
			.then((response: any) => {
				seatInfoData.exhibition = response.data.exhibition;
				seatInfoData.name = response.data.name;
				seatInfoData.isActive = response.data.is_active;
				seatInfoData.is_excel_required = response.data.is_excel_required;
				seatInfoData.privacy_policy = response.data.seat_privacy_policy_lang;
				privacyPolicyLang = response.data.seat_privacy_policy_lang;
				seatInfoData.price_per_meter = response.data.price_per_meter;
				seatInfoData.discounted_price = response.data.discounted_price;
				seatInfoData.extra_discount = response.data.extra_discount;
				excel_preview_url = response.data.excel_preview_url;
				if (response.data.areas) {
					areas = JSON.parse(response.data.areas);
				}
				if (response.data.services) {
					const responseData = JSON.parse(response.data.services);
					updateServicesWithResponse(responseData);
					existingServices = JSON.parse(response.data.services);
				}
			});
	}

	// get the current services that exist in db
	function updateServicesWithResponse(responseData: any) {
		responseData.forEach((responseService: any) => {
			const serviceIndex = seatServices.findIndex(
				(service) => service.serviceId === responseService.serviceId
			);
			if (serviceIndex !== -1) {
				seatServices[serviceIndex] = {
					...seatServices[serviceIndex],
					...responseService,
					selected: true,
					unlimitedFree: responseService.unlimitedFree ?? seatServices[serviceIndex].unlimitedFree // Set unlimitedFree based on the database value, defaulting to the existing value in seatServices
				};
			}
		});
	}

	const handleCheckboxChange = (serviceId: number, checked: boolean) => {
		const index = seatServices.findIndex((service) => service.id === serviceId);
		if (index !== -1) {
			seatServices[index].selected = checked;

			// If the service is deselected, reset its fields
			if (!checked) {
				seatServices[index].maxFreeCount = 0;
				seatServices[index].maxQuantityPerUser = 0;
				seatServices[index].unlimitedFree = false;
			}
		}
	};

	// for getting modal data
	const handleInputChange = (serviceId: number, field: string, value: number) => {
		const index = seatServices?.findIndex((service) => service.id === serviceId);
		if (index !== -1) {
			// Convert value to a number if it's one of the numeric fields
			if (field === 'maxFreeCount' || field === 'maxQuantityPerUser') {
				seatServices[index][field] = Number(value);
			} else {
				seatServices[index][field] = value;
			}
		}
	};

	// Add a new function to handle changes to the 'unlimitedFree' checkbox
	const handleUnlimitedFreeChange = (serviceId: number, checked: boolean) => {
		const index = seatServices.findIndex((service) => service.id === serviceId);
		if (index !== -1) {
			seatServices[index].unlimitedFree = checked;
			if (checked) {
				seatServices[index].maxFreeCount = 0;
			}
		}
	};

	function addSelectedServices() {
		const selectedServices = seatServices.filter((service) => service.selected);

		existingServices = selectedServices.map((service) => {
			return {
				serviceId: service.serviceId,
				maxFreeCount: service.maxFreeCount,
				maxQuantityPerUser: service.maxQuantityPerUser,
				unlimitedFree: service.unlimitedFree
			};
		});
	}

	function prepareDataForUpdate() {
		// Serialize the existingServices into a JSON string
		const servicesData = JSON.stringify(
			existingServices.map((service) => ({
				serviceId: service.serviceId,
				maxFreeCount: service.maxFreeCount,
				maxQuantityPerUser: service.maxQuantityPerUser,
				unlimitedFree: service.unlimitedFree
			}))
		);
		return servicesData;
	}

	async function updatedSeat() {
		formSubmitted = true;
		const supabase = data.supabase;
		if (!seatInfoData.name || !seatInfoData.exhibition || seatInfoData.isActive === undefined) {
			return;
		}
		loading = true;

		try {
			const areasArray = JSON.stringify(areas);

			// deactivate other seats with the same exhibition ID
			if (seatInfoData.isActive) {
				const { data: activeSeats, error: fetchError } = await supabase
					.from('seat_layout')
					.select('id')
					.eq('exhibition', seatInfoData.exhibition.id)
					.eq('is_active', true)
					.not('id', 'eq', $page.params.reservationId); // Exclude the current seat

				if (fetchError) {
					loading = false;
					return;
				}

				if (activeSeats.length > 0) {
					const seatIds = activeSeats.map(seat => seat.id);
					await supabase
						.from('seat_layout')
						.update({ is_active: false })
						.in('id', seatIds);
				}
			}

			if (excelFilePreviewSelected) {
				const randomText = getRandomTextNumber();
				const response = await supabase.storage
					.from('image')
					.upload(
						`seat_layout/${randomText}_${excelFilePreviewSelected.name}`,
						excelFilePreviewSelected
					);
				if (response.data) {
					excel_preview_url = response.data.path;
				}
			}

			// Send new service
			addSelectedServices();
			const servicesData = prepareDataForUpdate();

			const response = await supabase.rpc('update_seat_and_seat_privacy', {
				seat_layout_data: {
					name: seatInfoData.name,
					is_active: seatInfoData.isActive,
					is_excel_required: seatInfoData.is_excel_required,
					exhibition: seatInfoData.exhibition?.id,
					areas: `${areasArray}`,
					services: servicesData,
					type: SeatsLayoutTypeEnum.AREAFIELDS,
					price_per_meter: seatInfoData.price_per_meter,
					id: $page.params.reservationId,
					discounted_price: seatInfoData.discounted_price,
					extra_discount: seatInfoData.extra_discount,
					price_sign: seatInfoData.price_sign,
					description_seat: seatInfoData.description_seat,
					excel_preview_url
				},
				privacy_lang_data: privacyPolicyLang
			});

			loading = false;
			if (response.error) {
				addNewToast({
					type: ToastTypeEnum.ERROR,
					message: 'Failed To Update this seat',
					title: 'Failed',
					duration: 1000
				});
			} else {
				addNewToast({
					type: ToastTypeEnum.SUCCESS,
					message: 'The Seat Updated Successfully',
					title: 'Success',
					duration: 1000
				});
				goto('/dashboard/seats_ui');
			}
			getSeatDetail();
		} catch (error) {
			loading = false;
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Failed To Update this seat',
				title: 'Failed',
				duration: 1000
			});
		}
	}

	function addNewArea() {
		areas.push(newArea);
		areas = [...areas];
		newArea = {
			area: '',
			quantity: 0
		};
	}
	function deleteArea(index: number) {
		areas.splice(index, 1);
		areas = [...areas];
	}
	function addPrivacyPolicyLang(description: any, lang: string) {
		let dataLang = privacyPolicyLang.find((x) => x.language == lang);
		if (dataLang) {
			dataLang.description = description.value;
		} else {
			privacyPolicyLang.push({
				description: description,
				language: lang as LanguageEnum,
				discount_description: '',
				extra_discount_description: '',
				price_sign: '',
				description_seat: ''
			});
		}
	}
	function addDiscountDetail(discount_description: any, lang: string) {
		let dataLang = privacyPolicyLang.find((x) => x.language == lang);
		if (dataLang) {
			dataLang.discount_description = discount_description.value;
		} else {
			privacyPolicyLang.push({
				description: '',
				language: lang as LanguageEnum,
				discount_description: discount_description,
				extra_discount_description: '',
				price_sign: '',
				description_seat: ''
			});
		}
	}
	function addPrivacyPolicyExtraDiscountDescription(description: any, lang: string) {
		let dataLang = privacyPolicyLang.find((x) => x.language == lang);
		if (dataLang) {
			dataLang.extra_discount_description = description.value;
		} else {
			privacyPolicyLang.push({
				description: '',
				language: lang as LanguageEnum,
				discount_description: '',
				extra_discount_description: description,
				price_sign: '',
				description_seat: ''
			});
		}
	}

	function addPriceSign(price_sign: any, lang: string) {
		let dataLang = privacyPolicyLang.find((x) => x.language == lang);
		if (dataLang) {
			dataLang.price_sign = price_sign.value;
		} else {
			privacyPolicyLang.push({
				description: '',
				language: lang as LanguageEnum,
				discount_description: '',
				extra_discount_description: '',
				price_sign: price_sign.value,
				description_seat: ''
			});
		}
	}

	function addDescriptionSeat(description_seat: any, lang: string) {
		let dataLang = privacyPolicyLang.find((x) => x.language == lang);
		if (dataLang) {
			dataLang.description_seat = description_seat.value;
		} else {
			privacyPolicyLang.push({
				description: '',
				language: lang as LanguageEnum,
				discount_description: '',
				extra_discount_description: '',
				price_sign: '',
				description_seat: description_seat.value
			});
		}
	}

	function handleFileUpload(e: any) {
		const fileInput = e.target as HTMLInputElement;
		excelFilePreviewSelected = fileInput.files![0];
	}
	let selectedEditArea = {
		area: '',
		quantity: 0,
		index: 0
	};
	function openEditModal(index: number) {
		isOpenEditModal = true;
		Object.assign(selectedEditArea, areas[index]);
		selectedEditArea.index = index;
	}
	function editSelectedArea() {
		areas[selectedEditArea.index] = selectedEditArea;
		areas = [...areas];
		isOpenEditModal = false;
	}
</script>
 
<div class="p-3">
	<button
		class="flex justify-start items-center gap-2 text-sm text-primary hover:transition-opacity duration-300 hover:opacity-70"
		on:click={() => goto('/dashboard/seats_ui')}
		>
		<IconArrowLeft size={20} />
		Back to Seats Dashboard  
	</button>
</div>
<Modal 
 class="bg-white dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]"
 size="sm"
title="Edit Area" bind:open={isOpenEditModal}  
autoclose>
	<div class=" w-full">
		<div class="my-2">
			<Label for="last_name" class="mb-2">Area By Meter</Label>
			<Input
				type="number"
				id="last_name"
				placeholder="Add area"
				bind:value={selectedEditArea.area}
			/>
		</div>
		<div>
			<Label for="company" class="mb-2">Quantity</Label>
			<Input
				type="number"
				id="company"
				placeholder="Add quantity"
				bind:value={selectedEditArea.quantity}
			/>
		</div>
		<div class="mt-6 w-full flex justify-end">
			<Button on:click={editSelectedArea}>Edit</Button>
		</div>
	</div></Modal
>
<div class="w-full h-full flex flex-col justify-center items-center">
	<div class="w-7/12 p-14 rounded-lg border-2 dark:border-gray-800 light:border-gray-500 my-5 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
		<Tabs contentClass="dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
			<TabItem title="Add Seat Area fields" open>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-2 p-6">
					<ButtonGroup class="" size="sm">
						<InputAddon>Name</InputAddon><Input
							type="text"
							size="sm"
							let:props
							placeholder={!seatInfoData.name && formSubmitted ? 'Name Required' : ' Name'}
							color={!seatInfoData.name && formSubmitted ? 'red' : 'base'}
							bind:value={seatInfoData.name}
						/></ButtonGroup
					>
					<ButtonGroup class="" size="sm">
						<InputAddon>price per meter</InputAddon><Input
							type="text"
							size="sm"
							bind:value={seatInfoData.price_per_meter}
						/></ButtonGroup
					>
					<Button
						color={!seatInfoData.exhibition && formSubmitted ? 'red' : 'light'}
						outline
						class=""
						style="
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			"
		   ><Chevron
							>{seatInfoData.exhibition && seatInfoData.exhibition.exhibition_languages
								? seatInfoData.exhibition.exhibition_languages[0].title
								: !seatInfoData.exhibition && formSubmitted
								? 'exhibition is required'
								: 'choose an exhibition'}</Chevron
						></Button
					>
					<Dropdown bind:open={dropdownOpen} ulClass="dropdownUi py-1 w-full" disabled={true}>
						{#if $exhibitions}
							{#each $exhibitions as exhibition}
								<DropdownItem on:click={() => (dropdownOpen = false)}>
									<!-- svelte-ignore a11y-click-events-have-key-events -->
									<!-- svelte-ignore a11y-no-static-element-interactions -->
						  <div
							style="text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
							"
										on:click={() => (seatInfoData.exhibition = exhibition)}
									>
										{exhibition.exhibition_languages
											? exhibition.exhibition_languages[0].title.length > 50
												? exhibition.exhibition_languages[0].title.slice(0, 50) + '...'
												: exhibition.exhibition_languages[0].title
											: ''}
									</div>
								</DropdownItem>
							{/each}
						{/if}
					</Dropdown>
					<Button
						color={seatInfoData.isActive == undefined && formSubmitted ? 'red' : 'light'}
						outline
						class=""
						><Chevron
							>{seatInfoData.isActive !== undefined
								? seatInfoData.isActive
									? 'Active'
									: 'Inactive'
								: seatInfoData.isActive == undefined && formSubmitted
								? 'status is required'
								: 'Seat Status'}</Chevron
						></Button
					>
					<Dropdown bind:open={isActiveDropdownOpen} ulClass="dropdownUi py-1 w-full">
						{#each serviceStatus as status}
							<DropdownItem on:click={() => (isActiveDropdownOpen = false)}>
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<div
									style="
								text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
							"
									on:click={() => (seatInfoData.isActive = status == SeatServiceStatusEnum.Active)}
								>
									{status}
								</div>
							</DropdownItem>
						{/each}
					</Dropdown>
					<ButtonGroup class="" size="sm">
						<InputAddon>Discounted Price</InputAddon><Input
							type="text"
							size="sm"
							bind:value={seatInfoData.discounted_price}
						/></ButtonGroup
					>
					<ButtonGroup class="" size="sm">
						<InputAddon>Extra Discounted Price</InputAddon><Input
							type="text"
							size="sm"
							bind:value={seatInfoData.extra_discount}
						/></ButtonGroup
					>
					<div class="flex items-center mb-4">
						<input
							bind:checked={seatInfoData.is_excel_required}
							id="default-checkbox"
							type="checkbox"
							class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
						/>
						<label
							for="default-checkbox"
							class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							>Is excel required</label
						>
					</div>
					<br />
					<!-- show modal  -->
					<div class="col-span-3">
						<Button on:click={() => (showModal = true)}>Add service</Button>
						<Modal
						class="bg-white dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]"
						size="lg"
						title="Update Services" 
						bind:open={showModal} 
						autoclose>
							<div class="max-h-96 overflow-y-auto p-4">
								<ul class="list-none space-y-4">
									{#each seatServices as service}
										<li class="flex items-center space-x-2">
											<div class="flex items-center space-x-2" style="width: 45%;">
												<Checkbox
													checked={service.selected}
													on:change={(e) => {
														if (e.target instanceof HTMLInputElement) {
															handleCheckboxChange(service.id, e.target.checked);
														}
													}}
												/>
												<span class="truncate">{service.title}</span>
											</div>

											<div style="width: 25%;">
												<Input
													type="number"
													placeholder="Max Quantity Per User"
													bind:value={service.maxQuantityPerUser}
													on:input={(e) => {
														if (e.target instanceof HTMLInputElement) {
															handleInputChange(service.id, 'maxQuantityPerUser', e.target.value);
														}
													}}
													disabled={!service.selected}
												/>
											</div>

											<div style="width: 30%;" class="flex">
												<div class="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 rounded-l px-2">
													<Checkbox
														checked={service.unlimitedFree}
														on:change={(e) => {
															if (e.target instanceof HTMLInputElement) {
																handleUnlimitedFreeChange(service.id, e.target.checked);
															}
														}}
														disabled={!service.selected}
													/>
													<span class="whitespace-nowrap text-sm">Unlimited</span>
												</div>
												<Input
													id="input-addon-sm"
													placeholder="max free quantity"
													bind:value={service.maxFreeCount}
													disabled={!service.selected || service.unlimitedFree}
													class="rounded-l-none"
												/>
											</div>
										</li>
									{/each}
								</ul>
							</div>
						</Modal>
					</div>

					<div class="col-span-3 my-4">
						<div class="max-w-[400px]">
							<p class="text-gray-600 dark:text-gray-300 mb-2">Upload image for sheet preview</p>
							<Fileupload
								accept=".jpg, .jpeg, .png"
								class=" dark:bg-white"
								on:change={(event) => handleFileUpload(event)}
							/>
						</div>
					</div>
					<div class="col-span-3 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
						<h1 class="mt-3 text-lg font-medium text-gray-600 dark:text-gray-300">Add Privacy Policy</h1>
						<Tabs contentClass="p-4 rounded-lg dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]" style="pill" class="p-4">
							{#each languageEnumKeys as lang}
								<TabItem title={lang} open={lang === languageEnumKeys[0]}>
									<Label for="price_sign">Price Sign</Label>
									<Input
										id="textarea-id"
										placeholder={`Add price sign for ${lang}`}
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)?.price_sign}
										on:input={(e) => addPriceSign(e.target, lang)}
									/>
									<Label for="price_sign">Description Seat</Label>
									<Textarea
										id="textarea-id"
										placeholder={`Add description seat for ${lang}`}
										rows="8"
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)?.description_seat}
										on:input={(e) => addDescriptionSeat(e.target, lang)}
									/>
									<Label for="price_sign">Privacy & Policy</Label>
									<Textarea
										id="textarea-id"
										placeholder={`Add privacy & policy for ${lang}`}
										rows="8"
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)?.description}
										on:input={(e) => addPrivacyPolicyLang(e.target ?? '', lang)}
									/>	
									<Label for="price_sign">Discount Description</Label>
									<Textarea
										id="textarea-id"
										placeholder={`Add discount description for  ${lang}`}
										rows="8"
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)
											?.discount_description}
										on:input={(e) => addDiscountDetail(e.target ?? '', lang)}
									/>
									<Label for="price_sign">Extra Discount Description</Label>
									<Textarea
										id="textarea-id"
										placeholder={`Add extra discount description for  ${lang}`}
										rows="8"
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)
											?.extra_discount_description}
										on:input={(e) => addPrivacyPolicyExtraDiscountDescription(e.target ?? '', lang)}
									/>
								</TabItem>
							{/each}
						</Tabs>
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-2 p-6">
					<div>
						<Label for="last_name" class="mb-2">Area By Meter</Label>
						<Input type="number" id="last_name" placeholder="Add area" bind:value={newArea.area} />
					</div>
					<div>
						<Label for="company" class="mb-2">Quantity</Label>
						<Input
							type="number"
							id="company"
							placeholder="Add quantity"
							bind:value={newArea.quantity}
						/>
					</div>
					<div class="flex items-end">
						<Button type="submit" on:click={addNewArea}>Add new Area</Button>
					</div>
				</div>

				<div class="px-6">
					<Table>
						<TableHead>
							<TableHeadCell class="dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}]">Area</TableHeadCell>
							<TableHeadCell class="dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}]">Quantity</TableHeadCell>
							<TableHeadCell class="dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}]" />
						</TableHead>
						<TableBody>
							{#each areas as area, index}
								<TableBodyRow>
									<TableBodyCell class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]">{area.area}M</TableBodyCell>
									<TableBodyCell class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]">{area.quantity}</TableBodyCell>
									<TableBodyCell class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]">
										<div class="flex gap-2">
											<PencilSquare class="cursor-pointer text-green-500" on:click={() => openEditModal(index)} />
											<Trash
												class="text-danger cursor-pointer"
												on:click={() => deleteArea(index)}
											/>
										</div>
									</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</div>
				<div class="flex justify-end mt-10">
					<Button type="submit" on:click={updatedSeat}>
						{#if loading}
							<Spinner class="mr-3" size="4" />
						{/if}
						Submit</Button
					>
				</div>
			</TabItem>
			<TabItem title="Add Company Info Required Data">
				<div class="dark:bg-[{THEME_COLORS.DARK.NAVBAR}] p-4 rounded-lg">
					<RequiredFieldsComponent
						exhibitionId={seatInfoData.exhibition?.id}
						supabase={data.supabase}
						detail={true}
					/>
				</div>
			</TabItem>
			<TabItem title="Upload Contract File">
				<div class="dark:bg-[{THEME_COLORS.DARK.NAVBAR}] p-4 rounded-lg">
					<UploadContractFile exhibitionId={seatInfoData.exhibition?.id} supabase={data.supabase} />
				</div>
			</TabItem>
		</Tabs>
	</div>
</div>
