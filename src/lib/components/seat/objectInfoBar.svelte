<script lang="ts">
	import {
		Button,
		ButtonGroup,
		Checkbox,
		Chevron,
		Dropdown,
		Input,
		InputAddon,
		Search
	} from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let data: {
		canvas: any;
		isAnObjectSelected: boolean;
		objectDetail: {
			selectable: boolean;
			services: [];
			price: number;
		};
		fillColor: string;
		itemWidth: number | undefined | null;
		itemHeight: number | undefined | null;
	};
	function addPropertiesToShape() {
		let selectedObject = data.canvas.getActiveObject();
		selectedObject.set({
			selectable: !data.objectDetail.selectable
		});
		data.objectDetail.selectable = !data.objectDetail.selectable;
		data.canvas.requestRenderAll();
	}
	function updateFillColor(event: any) {
		data.fillColor = event.target.value;
		updateFillProperties();
	}
	function updateFillProperties() {
		// Get the selected object (e.g., assuming it's the last added object)
		let selectedObject = data.canvas.getActiveObject();

		// Update the fill properties of the selected object
		selectedObject.set({
			fill: data.fillColor
		});

		// Trigger canvas rendering
		data.canvas.requestRenderAll();
	}
</script>

<div class="p-4 bg-secondary">
	{#if data.canvas && data.isAnObjectSelected}
		<div class="pb-4 w-full">
			<Button on:click={addPropertiesToShape} class="w-full" outline>
				<Checkbox checked={data.objectDetail.selectable} />

				selectable
			</Button>
		</div>
	{/if}

	<input type="color" id="color-picker" bind:value={data.fillColor} on:input={updateFillColor} />
	<div class="grid grid-cols-2 gap-4 my-4">
		<ButtonGroup class="w-full" size="sm">
			<InputAddon>W</InputAddon><Input
				type="number"
				size="sm"
				disabled={data.itemWidth === null || data.itemWidth === undefined}
				bind:value={data.itemWidth}
				on:input={updateItemWidth}
				placeholder="Width"
				let:props
			/></ButtonGroup
		>
		<ButtonGroup class="w-full" size="sm">
			<InputAddon>H</InputAddon><Input
				type="number"
				size="sm"
				disabled={data.itemWidth === null || data.itemWidth === undefined}
				bind:value={data.itemHeight}
				on:input={updateItemHeight}
				placeholder="Height"
				let:props
			/></ButtonGroup
		>
		<ButtonGroup class="w-full" size="sm">
			<InputAddon>(</InputAddon><Input
				type="number"
				disabled={topLeftRadius === null || topLeftRadius === undefined}
				size="sm"
				value={topLeftRadius}
				on:input={(value) => updateCustomRectangle(value, 'tl')}
				placeholder="Radius"
			/></ButtonGroup
		>
		<ButtonGroup class="w-full" size="sm">
			<InputAddon>(</InputAddon><Input
				type="number"
				disabled={topRightRadius === null || topRightRadius === undefined}
				size="sm"
				value={topRightRadius}
				on:input={(value) => updateCustomRectangle(value, 'tr')}
				placeholder="Radius"
				let:props
			/></ButtonGroup
		>
		<ButtonGroup class="w-full" size="sm">
			<InputAddon>(</InputAddon><Input
				type="number"
				disabled={bottomLeftRadius === null || bottomLeftRadius === undefined}
				size="sm"
				value={bottomLeftRadius}
				on:input={(value) => updateCustomRectangle(value, 'bl')}
				placeholder="Radius"
				let:props
			/></ButtonGroup
		>
		<ButtonGroup class="w-full" size="sm">
			<InputAddon>(</InputAddon><Input
				type="number"
				disabled={bottomRightRadius === null || bottomRightRadius === undefined}
				size="sm"
				value={bottomRightRadius}
				on:input={(value) => updateCustomRectangle(value, 'br')}
				placeholder="Radius"
				let:props
			/></ButtonGroup
		>
		<div class="flex col-span-2">
			<ButtonGroup class="w-full" size="sm">
				<InputAddon
					><input
						bind:value={strokeColor}
						on:input={updateStrokeColor}
						type="color"
						id="stroke-color-picker"
					/></InputAddon
				><Input
					disabled={strokeWidth === null || strokeWidth === undefined}
					type="number"
					size="sm"
					bind:value={strokeWidth}
					on:input={updateStrokeWidth}
					placeholder="Stroke"
					let:props
				/></ButtonGroup
			>
		</div>
	</div>
	{#if objectDetail.selectable}
		<div class="w-full">
			<ButtonGroup class="w-full mb-2" size="sm">
				<InputAddon>Price</InputAddon><Input
					type="number"
					size="sm"
					placeholder="select price"
					bind:value={objectDetail.price}
				/></ButtonGroup
			>
			<Button id="placements" class="w-full"><Chevron>Services</Chevron></Button>
			<Dropdown class="overflow-y-auto px-3 pb-3 text-sm mx-3 ">
				<div slot="header" class="p-3">
					<Search size="md" />
				</div>
				{#if $seatServices}
					{#each $seatServices as service}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<li
							class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
							on:click={() => {
								addServiceToActiveObject(service);
							}}
						>
							{#if service.seat_services_languages}
								<div class="flex justify-between">
									<Checkbox
										disabled={true}
										class="cursor-pointer"
										checked={objectDetail.services.some((x) => x.id === service.id)}
										>{service.seat_services_languages[0].title}</Checkbox
									>

									<img
										src={getImage(service.icon)}
										class="w-8 h-8 rounded-full mr-3"
										alt="niaaaa"
									/>
								</div>
							{/if}
						</li>
					{/each}
				{/if}
			</Dropdown>
		</div>
	{/if}
</div>
