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
		Spinner,
		Textarea
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

	export let data: any;
	interface areaType {
		area: string;
		quantity: number;
	}

	let seatInfoData: {
		exhibition?: ExhibitionsModel;
		name: string;
		isActive?: boolean;
		privacy_policy?: string;
		price_per_meter?: number;
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

	async function addNewSeat() {
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
		console.log(`${areasArray}`);
		await supabase
			.rpc('insert_seat_and_seat_privacy', {
				seat_layout_data: {
					name: seatInfoData.name,
					is_active: seatInfoData.isActive,
					exhibition: seatInfoData.exhibition?.id,
					areas: `${areasArray}`,
					type: SeatsLayoutTypeEnum.AREAFIELDS,
					price_per_meter: seatInfoData.price_per_meter
				},
				privacy_lang_data: privacyPolicyLang
			})
			.then(() => {
				loading = false;
				addNewToast({
					type: ToastTypeEnum.SUCCESS,
					message: 'The Seat Added Successfully',
					title: 'Success',
					duration: 1000
				});
			})
			.catch(() => {
				loading = false;
			});
	}
	function addPrivacyPolicyLang(description: any, lang: string) {
		privacyPolicyLang = privacyPolicyLang.filter((x) => x.language !== lang);
		privacyPolicyLang.push({ description: description.value, language: lang as LanguageEnum });
	}
</script>

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
										on:input={(e) => addPrivacyPolicyLang(e.target ?? '', lang)}
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
