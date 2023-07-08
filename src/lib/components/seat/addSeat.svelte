<script lang="ts">
	import {
		Button,
		ButtonGroup,
		Checkbox,
		Chevron,
		Dropdown,
		DropdownItem,
		Input,
		InputAddon,
		Search
	} from 'flowbite-svelte';
	import { getData, exhibitions } from '../../../stores/exhibitionStore';
	import { onMount } from 'svelte';
	import { SeatServiceStatusEnum } from '../../../models/seatServiceStatusEnum';
	import type { ExhibitionsModel } from '../../../models/exhibitionModel';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { canvasToDataUrl, canvasToFile } from '$lib/utils/canva_to_image';

	export let data: any;
	export let seatInfo: any;

	console.log(seatInfo);
	interface SeatServiceStatusEnum {
		[key: string]: SeatServiceStatusEnum;
	}
	let dropdownOpen = false;
	let isActiveDropdownOpen = false;
	let seatInfoData: {
		exhibition?: ExhibitionsModel;
		name: string;
		isActive?: boolean;
	} = {
		exhibition: undefined,
		name: '',
		isActive: undefined
	};
	let serviceStatus = (
		Object.keys(SeatServiceStatusEnum) as Array<keyof typeof SeatServiceStatusEnum>
	).map((key) => SeatServiceStatusEnum[key]);

	console.log(serviceStatus);
	console.log(data);
	onMount(async () => {
		const response = await getData(data.supabase, 1, 15);
		console.log(response);
	});

	async function addNewSeat() {
		console.log(seatInfoData);
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
		const supabase = data.supabase;
		console.log(json);
		const randomImageName = getRandomTextNumber();
		const canvasImage = await canvasToFile(seatInfo.canvas, randomImageName);
		//upload canvas image to supabase storage
		const fileResult = await supabase.storage
			.from('image')
			.upload(`seats_layout/${canvasImage.name}`, canvasImage);
		console.log(fileResult.data);
		if (!fileResult.data) {
			// alertStore.addAlert('error', 'Could not convert canvas to image', 'error');
			return;
		}

		const seatId = seatInfo.seatId;
		if (seatId !== 'create') {
			const result = await supabase
				.from('seat_layout ')
				.update([
					{
						name: 'text',
						design: json,
						is_active: true,
						exhibition: 1,
						image_url: fileResult.data.path
					}
				])
				.eq('id', seatId)
				.then((res) => {
					console.log(res);
				});
		} else {
			const result = await supabase
				.from('seat_layout ')
				.insert([
					{
						name: seatInfoData.name,
						design: json,
						is_active: seatInfoData.isActive,
						exhibition: seatInfoData.exhibition?.id,
						image_url: fileResult.data.path
					}
				])
				.then((res) => {
					console.log(res);
				});
		}
	}
</script>

<div>
	<ButtonGroup class="" size="sm">
		<InputAddon>Name</InputAddon><Input
			type="text"
			size="sm"
			placeholder="Name"
			let:props
			bind:value={seatInfoData.name}
		/></ButtonGroup
	>
	<Button
		color="light"
		outline
		class=" w-64 "
		style="
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	"
		><Chevron
			>{seatInfoData.exhibition && seatInfoData.exhibition.exhibition_languages
				? seatInfoData.exhibition.exhibition_languages[0].title
				: 'choose an exhibition'}</Chevron
		></Button
	>
	<Dropdown bind:open={dropdownOpen} ulClass="dropdownUi py-1 w-44 ">
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
	<Button color="light" outline class=" w-64 "
		><Chevron
			>{seatInfoData.isActive !== undefined
				? seatInfoData.isActive
					? 'Active'
					: 'Inactive'
				: 'Seat Status'}</Chevron
		></Button
	>
	<Dropdown bind:open={isActiveDropdownOpen} ulClass="dropdownUi py-1 w-44 ">
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
	<Button on:click={addNewSeat}>Add</Button>
</div>
