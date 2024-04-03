<script lang="ts">
	import { Trash } from 'svelte-heros-v2';
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
		Fileupload,
		Modal
	} from 'flowbite-svelte';
	import type { ExhibitionsModel } from '../../../../models/exhibitionModel';
	import { exhibitions, getData } from '../../../../stores/exhibitionStore';
	import { SeatServiceStatusEnum } from '../../../../models/seatServiceStatusEnum';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { SeatPrivacyPolicyModel } from '../../../../models/addSeatDataModel';
	import { addNewToast } from '../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../models/toastTypeEnum';
	import { onMount } from 'svelte';
	import RequiredFieldsComponent from './requiredFields.svelte';
	import { SeatsLayoutTypeEnum } from '../../../../models/seatsLayoutTypeEnum';
	import UploadContractFile from './uploadContractFile.svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { Checkbox } from 'flowbite-svelte';
	import type { PageData } from '../$types';

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
	let loading = false;
	let serviceStatus = (
		Object.keys(SeatServiceStatusEnum) as Array<keyof typeof SeatServiceStatusEnum>
	).map((key) => SeatServiceStatusEnum[key]);

	let languageEnumKeys = Object.values(LanguageEnum);

	let formSubmitted = false;
	let dropdownOpen = false;
	let isActiveDropdownOpen = false;
	let areas: areaType[] = [];

	let privacyPolicyLang: SeatPrivacyPolicyModel[] = [];
	let excelFilePreviewSelected: File;

	let newArea: areaType = {
		area: '',
		quantity: 0
	};

	onMount(async () => {
		await getData(data.supabase);
	});

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

	// for getting modal data

	const handleInputChange = (serviceId: number, field: string, value: any) => {
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

	const handleCheckboxChange = (serviceId: number, checked: boolean) => {
		const index = seatServices.findIndex((service) => service.id === serviceId);
		if (index !== -1) {
			seatServices[index].selected = checked;
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

	async function addNewSeat() {
		formSubmitted = true;
		const supabase = data.supabase;

		if (!seatInfoData.name || !seatInfoData.exhibition || seatInfoData.isActive == undefined) {
			return;
		}

		loading = true;

		try {
			if (seatInfoData.isActive) {
				await supabase
					.from('seat_layout')
					.update({ is_active: false })
					.eq('exhibition', seatInfoData.exhibition?.id);
			}

			let excel_preview_url = '';
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

			const areasArray = JSON.stringify(areas);
			const selectedServices = seatServices
				.filter((service) => service.selected)
				.map((service) => ({
					serviceId: service.serviceId,
					maxFreeCount: Number(service.maxFreeCount),
					maxQuantityPerUser: Number(service.maxQuantityPerUser),
					unlimitedFree: service.unlimitedFree
				}));

			const response = await supabase.rpc('insert_seat_and_seat_privacy', {
				seat_layout_data: {
					services: selectedServices,
					name: seatInfoData.name,
					is_active: seatInfoData.isActive,
					exhibition: seatInfoData.exhibition?.id,
					areas: `${areasArray}`,
					type: SeatsLayoutTypeEnum.AREAFIELDS,
					price_per_meter: seatInfoData.price_per_meter,
					discounted_price: seatInfoData.discounted_price,
					excel_preview_url,
					extra_discount: seatInfoData.extra_discount
				},
				privacy_lang_data: privacyPolicyLang
			});

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
		} catch (error) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Failed To Update this seat',
				title: 'Failed',
				duration: 1000
			});
		} finally {
			loading = false;
		}
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

	function addPrivacyPolicyExtraDiscountDescription(description: any, lang: string) {
		let descriptionValue = (description as HTMLInputElement).value;

		let dataLang = privacyPolicyLang.find((x) => x.language == lang);
		if (dataLang) {
			dataLang.extra_discount_description = descriptionValue;
		} else {
			privacyPolicyLang.push({
				description: '',
				language: lang as LanguageEnum,
				discount_description: '',
				extra_discount_description: descriptionValue
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

	function handleFileUpload(e: any) {
		const fileInput = e.target as HTMLInputElement;
		excelFilePreviewSelected = fileInput.files![0];
	}

	// return services

	let showModal = false;
	let seatServices: serviceType[] = [];

	onMount(async () => {
		const response = await data.supabase
			.from('seat_services')
			.select('*, seat_services_languages(*)')
			.order('position', { ascending: true });

		// console.log('response', response);

		seatServices = response?.data?.map((service) => ({
			serviceId: service.id,
			id: service.id,
			title:
				service.seat_services_languages.find((lang: any) => lang.language === 'en')?.title ||
				'No title',
			selected: false,
			quantity: 0,
			maxFreeCount: 0,
			unlimitedFree: false
		}));
	});
</script>

<div class="w-full h-full flex flex-col justify-center items-center">
	<div class="w-7/12 p-14 rounded-lg border-2 dark:border-gray-800 light:border-gray-500 my-5">
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
						><Chevron
							>{seatInfoData.exhibition && seatInfoData.exhibition.exhibition_languages
								? seatInfoData.exhibition.exhibition_type
								: !seatInfoData.exhibition && formSubmitted
								? 'exhibition is required'
								: 'choose an exhibition'}</Chevron
						></Button
					>
					<Dropdown bind:open={dropdownOpen} ulClass="dropdownUi py-1 w-full">
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
										{exhibition.exhibition_type ?? ''}
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
						<Modal title="List of Services" bind:open={showModal} autoclose>
							<ul class="list-disc pl-5 space-y-2">
								{#each seatServices as service}
									<li class="flex items-center space-x-2">
										<Checkbox
											on:change={(e) => {
												if (e.target instanceof HTMLInputElement) {
													handleCheckboxChange(service.id, e.target.checked);
												}
											}}
										/>
										<div class="w-full">
											{service.title}
										</div>

										<Input
											type="number"
											placeholder="Max Quantity Per User"
											bind:value={service.maxQuantityPerUser}
											on:input={(e) => {
												const target = e.target;
												if (target instanceof HTMLInputElement) {
													handleInputChange(service.id, 'maxQuantityPerUser', target.value);
												}
											}}
											disabled={!service.selected}
										/>

										<ButtonGroup class="w-full" size="sm">
											<InputAddon>
												<div class="flex items-center">
													<Checkbox
														bind:value={service.unlimitedFree}
														class="cursor-pointer"
														on:change={(e) => {
															const target = e.target;
															if (target instanceof HTMLInputElement) {
																handleUnlimitedFreeChange(service.id, target.checked);
															}
														}}
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

					<br />
					<div class="col-span-3 my-4">
						<div class="max-w-[400px]">
							<p>upload image for sheet preview</p>
							<Fileupload
								accept=".jpg, .jpeg, .png"
								class=" "
								on:change={(event) => handleFileUpload(event)}
							/>
						</div>
					</div>

					<h1 class="mt-3 text-lg font-medium">add privacy policy</h1>
					<div class=" col-span-3">
						<Tabs>
							{#each languageEnumKeys as lang}
								<TabItem title={lang} open={lang === languageEnumKeys[0]}>
									<Textarea
										id="textarea-id"
										placeholder={`add privacy & policy for ${lang}`}
										rows="8"
										class="my-3 col-span-3"
										value={privacyPolicyLang?.find((x) => x.language === lang)?.description}
										on:input={(e) => addPrivacyPolicyLang(e.target, lang)}
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
										on:input={(e) => addPrivacyPolicyExtraDiscountDescription(e.target, lang)}
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
										<Trash class="text-danger cursor-pointer" on:click={() => deleteArea(index)} />
									</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</div>
				<div class="flex justify-end mt-10">
					<Button type="submit" on:click={addNewSeat}>Submit</Button>
				</div>
			</TabItem>
			<TabItem title="add Company Info Required Data">
				<RequiredFieldsComponent
					exhibitionId={seatInfoData.exhibition?.id}
					supabase={data.supabase}
				/>
			</TabItem>
			<TabItem title="upload contract file">
				<UploadContractFile exhibitionId={seatInfoData.exhibition?.id} supabase={data.supabase} />
			</TabItem>
		</Tabs>
	</div>
</div>
