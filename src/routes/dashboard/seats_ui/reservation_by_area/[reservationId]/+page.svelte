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

	export let data: any;
	interface areaType {
		area: string;
		quantity: number;
	}
	interface serviceType {
		serviceId: number;
		maxFreeCount: number;
		maxQuantityPerUser: number;
		unlimitedFree: boolean;
	}

	let excelFilePreviewSelected: File;

	let seatInfoData: {
		exhibition?: ExhibitionsModel;
		name: string;
		isActive?: boolean;
		privacy_policy?: string;
		price_per_meter?: number;
		discounted_price?: number;
		extra_discount?: number;
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

	let responseServices: serviceType[];

	let newArea: areaType = {
		area: '',
		quantity: 0
	};
	onMount(async () => {
		await getData(data.supabase);
		await getSeatDetail();
	});

	onMount(async () => {
		const response = await data.supabase
			.from('seat_services')
			.select('*, seat_services_languages(*)');
		seatServices = response.data.map((service) => ({
			serviceId: service.id,
			id: service.id,
			title:
				service.seat_services_languages.find((lang) => lang.language === 'en')?.title || 'No title',
			selected: false,
			quantity: 0,
			maxFreeCount: 0,
			unlimitedFree: false
		}));
	});
	async function getSeatDetail() {
		await data.supabase
			.from('seat_layout')
			.select('*,exhibition(*,exhibition_languages(*)),seat_privacy_policy_lang(*)')
			.eq('id', $page.params.reservationId)
			.single()
			.then((response: any) => {
				responseServices = response.data.services;
				seatInfoData.exhibition = response.data.exhibition;
				seatInfoData.name = response.data.name;
				seatInfoData.isActive = response.data.is_active;
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
				}
			});
		console.log(responseServices);
	}

	// get the current services that exist in db
	function updateServicesWithResponse(responseData) {
		responseData.forEach((responseService) => {
			const serviceIndex = seatServices.findIndex(
				(service) => service.serviceId === responseService.serviceId
			);
			if (serviceIndex !== -1) {
				seatServices[serviceIndex] = {
					...seatServices[serviceIndex],
					...responseService
				};
			}
		});
	}

	const handleCheckboxChange = (serviceId, checked) => {
		const index = seatServices.findIndex((service) => service.id === serviceId);
		if (index !== -1) {
			seatServices[index].selected = checked;
		}
	};
	// for getting modal data
	const handleInputChange = (serviceId, field, value) => {
		const index = seatServices.findIndex((service) => service.id === serviceId);
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
	const handleUnlimitedFreeChange = (serviceId, checked) => {
		const index = seatServices.findIndex((service) => service.id === serviceId);
		if (index !== -1) {
			seatServices[index].unlimitedFree = checked;
			if (checked) {
				seatServices[index].maxFreeCount = 0;
			}
		}
	};

	async function updatedSeat() {
		formSubmitted = true;
		const supabase = data.supabase;
		if (!seatInfoData.name || !seatInfoData.exhibition || seatInfoData.isActive == undefined) {
			return;
		}
		loading = true;
		if (seatInfoData.isActive) {
			await supabase
				.from('seat_layout')
				.update({ is_active: false })
				.eq('exhibition', seatInfoData.exhibition?.id);
		}
		const areasArray = JSON.stringify(areas);

		if (excelFilePreviewSelected) {
			const randomText = getRandomTextNumber();
			await supabase.storage
				.from('image')
				.upload(
					`seat_layout/${randomText}_${excelFilePreviewSelected.name}`,
					excelFilePreviewSelected
				)
				.then((response: any) => {
					excel_preview_url = response.data.path;
				});
		}

		const selectedServices = seatServices
			.filter((service) => service.selected)
			.map((service) => ({
				serviceId: service.serviceId,
				maxFreeCount: Number(service.maxFreeCount),
				maxQuantityPerUser: Number(service.maxQuantityPerUser),
				unlimitedFree: service.unlimitedFree
			}));

		await supabase
			.rpc('update_seat_and_seat_privacy', {
				seat_layout_data: {
					name: seatInfoData.name,
					is_active: seatInfoData.isActive,
					exhibition: seatInfoData.exhibition?.id,
					areas: `${areasArray}`,
					services: JSON.stringify(seatServices),
					type: SeatsLayoutTypeEnum.AREAFIELDS,
					price_per_meter: seatInfoData.price_per_meter,
					id: $page.params.reservationId,
					discounted_price: seatInfoData.discounted_price,
					extra_discount: seatInfoData.extra_discount,
					excel_preview_url
				},
				privacy_lang_data: privacyPolicyLang
			})
			.then((response: any) => {
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
						message: 'The Seat Added Successfully',
						title: 'Success',
						duration: 1000
					});
				}
				getSeatDetail();
			})
			.catch(() => {
				loading = false;
				addNewToast({
					type: ToastTypeEnum.ERROR,
					message: 'Failed To Update this seat',
					title: 'Failed',
					duration: 1000
				});
			});
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
				extra_discount_description: ''
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
				extra_discount_description: ''
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
				extra_discount_description: description
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

<Modal title="edit Area" bind:open={isOpenEditModal} class="bg-white max-w-sm mx-auto " autoclose>
	<div class=" w-full">
		<div class="my-2">
			<Label for="last_name" class="mb-2">Area By Meter</Label>
			<Input
				type="number"
				id="last_name"
				placeholder="add area"
				bind:value={selectedEditArea.area}
			/>
		</div>
		<div>
			<Label for="company" class="mb-2">Quantity</Label>
			<Input
				type="number"
				id="company"
				placeholder="add quantity"
				bind:value={selectedEditArea.quantity}
			/>
		</div>
		<div class="mt-6 w-full flex justify-end">
			<Button on:click={editSelectedArea}>Edit</Button>
		</div>
	</div></Modal
>
<div class="w-full h-full flex flex-col justify-center items-center">
	<div class="bg-[#f9fafb] w-7/12 p-14 rounded-lg">
		<Tabs>
			<TabItem title="add Seat Area fields" open>
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
						disabled={true}
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
										style="
								text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
							"
										on:click={() => (seatInfoData.exhibition = exhibition)}
									>
										{exhibition.exhibition_languages
											? exhibition.exhibition_languages[0].title
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
					<br />
					<!-- show modal  -->
					<div class="col-span-3">
						<Button on:click={() => (showModal = true)}>Add service</Button>
						<Modal title="Update Services" bind:open={showModal} autoclose>
							<ul class="list-disc pl-5 space-y-2">
								{#each seatServices as service}
									<li class="flex items-center space-x-2">
										<Checkbox on:change={(e) => handleCheckboxChange(service.id, e.target.checked)}>
											{service.title}
										</Checkbox>

										<Input
											type="number"
											placeholder="Max Quantity Per User"
											bind:value={service.maxQuantityPerUser}
											on:input={(e) =>
												handleInputChange(service.id, 'maxQuantityPerUser', e.target.value)}
											disabled={!service.selected}
										/>

										<ButtonGroup class="w-full" size="sm">
											<InputAddon>
												<div class="flex items-center">
													<!-- {responseServices?.find((x) => x.serviceId === service.serviceId)
														?.unlimitedFree} -->

													<Checkbox
														bind:value={service.unlimitedFree}
														class="cursor-pointer"
														on:change={(e) =>
															handleUnlimitedFreeChange(service.id, e.target.checked)}
														disabled={!service.selected}
													/>

													<p>Unlimited</p>
												</div>
											</InputAddon>

											<Input
												id="input-addon-sm"
												placeholder="max free quantity for a user"
												bind:value={service.maxFreeCount}
												disabled={!service.selected || service.unlimitedFree}
											/>
										</ButtonGroup>
									</li>
								{/each}
							</ul>
						</Modal>
					</div>

					<div class="col-span-3 my-4">
						<div class="max-w-[400px]">
							<p>upload image for sheet preview</p>
							<Fileupload
								accept=".jpg, .jpeg, .png"
								class=" dark:bg-white"
								on:change={(event) => handleFileUpload(event)}
							/>
						</div>
					</div>
					<div class=" col-span-3">
						<h1 class="mt-3 text-lg font-medium">add privacy policy</h1>
						<Tabs>
							{#each languageEnumKeys as lang}
								<TabItem title={lang} open={lang === languageEnumKeys[0]}>
									<Textarea
										id="textarea-id"
										placeholder={`add privacy & policy for ${lang}`}
										rows="8"
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)?.description}
										on:input={(e) => addPrivacyPolicyLang(e.target ?? '', lang)}
									/>
									<Textarea
										id="textarea-id"
										placeholder={`add discount description for  ${lang}`}
										rows="8"
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)
											?.discount_description}
										on:input={(e) => addDiscountDetail(e.target ?? '', lang)}
									/>
									<Textarea
										id="textarea-id"
										placeholder={`add extra discount description for  ${lang}`}
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
						<Input type="number" id="last_name" placeholder="add area" bind:value={newArea.area} />
					</div>
					<div>
						<Label for="company" class="mb-2">Quantity</Label>
						<Input
							type="number"
							id="company"
							placeholder="add quantity"
							bind:value={newArea.quantity}
						/>
					</div>
					<div class="flex items-end">
						<Button type="submit" on:click={addNewArea}>add new Area</Button>
					</div>
				</div>

				<div class="px-6">
					<Table>
						<TableHead>
							<TableHeadCell>area</TableHeadCell>
							<TableHeadCell>quantity</TableHeadCell>
							<TableHeadCell />
						</TableHead>
						<TableBody>
							{#each areas as area, index}
								<TableBodyRow>
									<TableBodyCell>{area.area}M</TableBodyCell>
									<TableBodyCell>{area.quantity}</TableBodyCell>
									<TableBodyCell>
										<div class="flex gap-2">
											<PencilSquare class=" cursor-pointer" on:click={() => openEditModal(index)} />
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
			<TabItem title="add Company Info Required Data">
				<RequiredFieldsComponent
					exhibitionId={seatInfoData.exhibition?.id}
					supabase={data.supabase}
					detail={true}
				/>
			</TabItem>
			<TabItem title="upload contract file">
				<UploadContractFile exhibitionId={seatInfoData.exhibition?.id} supabase={data.supabase} />
			</TabItem>
		</Tabs>
	</div>
</div>
