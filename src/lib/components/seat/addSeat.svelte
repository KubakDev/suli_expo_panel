<script lang="ts">
	import {
		Button,
		ButtonGroup,
		Chevron,
		Dropdown,
		DropdownItem,
		Input,
		InputAddon,
		Spinner,
		TabItem,
		Tabs,
		Textarea
	} from 'flowbite-svelte';
	import { getData, exhibitions } from '../../../stores/exhibitionStore';
	import { createEventDispatcher, onMount } from 'svelte';
	import { SeatServiceStatusEnum } from '../../../models/seatServiceStatusEnum';
	import type { ExhibitionsModel } from '../../../models/exhibitionModel';
	import { ToastTypeEnum } from '../../../models/toastTypeEnum';
	import { addNewToast } from '../../../stores/toastStore';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { SeatPrivacyPolicyModel } from '../../../models/addSeatDataModel';
	import { canvasToFile } from '$lib/utils/canva_to_image';

	export let data: any;
	export let seatInfo: any;
	export let currentSeatLayoutData: any = undefined;
	const dispatch = createEventDispatcher();

	let languageEnumKeys = Object.values(LanguageEnum);
	let loading = false;
	let formSubmitted = false;
	let dropdownOpen = false;
	let isActiveDropdownOpen = false;
	let seatInfoData: {
		exhibition?: ExhibitionsModel;
		name: string;
		isActive?: boolean;
		privacy_policy?: string;
	} = {
		exhibition: undefined,
		name: '',
		isActive: undefined
	};
	let privacyPolicyLang: SeatPrivacyPolicyModel[] = [];
	let serviceStatus = (
		Object.keys(SeatServiceStatusEnum) as Array<keyof typeof SeatServiceStatusEnum>
	).map((key) => SeatServiceStatusEnum[key]);

	onMount(async () => {
		await getData(data.supabase);

		if (seatInfo.seatId !== 'create') {
			seatInfoData = {
				exhibition: currentSeatLayoutData.exhibition,
				name: currentSeatLayoutData.name,
				isActive: currentSeatLayoutData.is_active,
				privacy_policy: currentSeatLayoutData.privacy_policy
			};
			privacyPolicyLang = currentSeatLayoutData.seat_privacy_policy_lang;
		}
	});

	async function addNewSeat() {
		let json = seatInfo.canvas.toObject([
			'left',
			'top',
			'width',
			'height',
			'fill',
			'id',
			'stroke',
			'strokeWidth',
			'icon',
			'selectable',
			'objectDetail'
		]);
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
		const randomImageName = getRandomTextNumber();
		const canvasImage = await canvasToFile(seatInfo.canvas, randomImageName);
		const fileResult = await supabase.storage
			.from('image')
			.upload(`seats_layout/${canvasImage.name}`, canvasImage);
		if (!fileResult.data) {
			return;
		}
		const seatId = seatInfo.seatId;
		if (seatId !== 'create') {
			await supabase
				.rpc('update_seat_and_seat_privacy', {
					seat_layout_data: {
						name: seatInfoData.name,
						design: json,
						is_active: seatInfoData.isActive,
						exhibition: seatInfoData.exhibition?.id,
						image_url: fileResult.data.path,
						id: +seatId
					},
					privacy_lang_data: privacyPolicyLang
				})
				.then(() => {
					loading = false;
					dispatch('closeModal');
					addNewToast({
						type: ToastTypeEnum.SUCCESS,
						message: 'The Seat Updated Successfully',
						title: 'Success',
						duration: 1000
					});
				})
				.catch(() => {
					loading = false;
				});
		} else {
			await supabase
				.rpc('insert_seat_and_seat_privacy', {
					seat_layout_data: {
						name: seatInfoData.name,
						design: json,
						is_active: seatInfoData.isActive,
						exhibition: seatInfoData.exhibition?.id,
						image_url: fileResult.data.path
					},
					privacy_lang_data: privacyPolicyLang
				})
				.then(() => {
					loading = false;
					dispatch('closeModal');
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
	}
	function addPrivacyPolicyLang(description: string, lang: string) {
		privacyPolicyLang = privacyPolicyLang.filter((x) => x.language !== lang);
		privacyPolicyLang.push({ description, language: lang as LanguageEnum });
	}
</script>

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
				? seatInfoData.exhibition.exhibition_languages[0]?.title
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
						{exhibition.exhibition_languages ? exhibition.exhibition_languages[0].title : ''}
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
						on:input={(e) => addPrivacyPolicyLang(e.target?.value ?? '', lang)}
					/>
				</TabItem>
			{/each}
		</Tabs>
	</div>
	<div class="col-span-3 flex justify-end">
		<Button on:click={addNewSeat}>
			{#if loading}
				<Spinner class="mr-3" size="4" color="white" />
			{/if}
			Add</Button
		>
	</div>
</div>
