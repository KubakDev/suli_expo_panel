<script lang="ts">
	import { Button, ButtonGroup, Input, InputAddon, Toggle } from 'flowbite-svelte';
	import { ArrowPath } from 'svelte-heros-v2';
	import * as d3 from 'd3';
	import { seatItemStore } from './seatItemStore';
	import { getSeatItemData } from './seatDesignUtils';
	import type { ItemPropertyModel } from '../../../models/itemPropertyModel';
	import { supabase } from '../../../supabase';

	export let placeHolder: string;
	let selectedSeatItem: string;
	let isSelectable = false;
	let itemWidth: string | undefined;
	let itemHeight: string | undefined;
	let itemRadius: string | undefined;
	let itemRotation: string | undefined;
	let itemX: string | undefined;
	let itemY: string | undefined;
	let itemPrice: string | undefined;

	let selectedSeatProperty: ItemPropertyModel = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		rotation: 0,
		radius: 0,
		selectedItem: null
	};

	let seatItemId: string | undefined | null;

	$: {
		if (selectedSeatProperty) {
			if (selectedSeatProperty.selectedItem) {
				const value = d3.select(selectedSeatProperty.selectedItem!.node());
				value
					.select('rect')
					.attr(
						'rx',
						typeof selectedSeatProperty.radius === 'number'
							? selectedSeatProperty.radius
							: parseInt(selectedSeatProperty.radius)
					)
					.attr(
						'ry',
						typeof selectedSeatProperty.radius === 'number'
							? selectedSeatProperty.radius
							: parseInt(selectedSeatProperty.radius)
					);
				const height =
					typeof selectedSeatProperty.height === 'number'
						? selectedSeatProperty.height
						: parseInt(selectedSeatProperty.height);
				const width =
					typeof selectedSeatProperty.width === 'number'
						? selectedSeatProperty.width
						: parseInt(selectedSeatProperty.width);

				if (
					parseInt(value.select('rect').attr('width')) != width ||
					parseInt(value.select('rect').attr('height')) != height
				) {
					value.select('rect').attr('width', width);
					value.select('rect').attr('height', height);
				}

				if (parseFloat(value.attr('data-rotation')) !== selectedSeatProperty.rotation) {
					const transform = value.attr('transform');
					const translateRegex = /translate\(([\d.]+),\s*([\d.]+)\)/;
					const translateMatch = transform.match(translateRegex);
					const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
					const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
					const centerX = width / 2;
					const centerY = height / 2;
					console.log('translateX listner', translateX);
					console.log('translateY listner', translateY);
					value.select('.resize-handle').attr('cx', width).attr('cy', height);
					const rotation = selectedSeatProperty.rotation;
					value
						.attr('data-rotation', rotation)
						.attr(
							'transform',
							`translate(${translateX},${translateY}) rotate(${rotation},${centerX},${centerY})`
						);
				}
			}
		}
	}

	async function onSave() {
		let shapesModel: any[] = [];
		const svgShapes = d3.select(placeHolder).selectAll('g');

		// convert all svg shapes to shapes model
		svgShapes.each(function (d, i) {
			const value = d3.select(this);
			console.log('each value ', value);
			const transform = value.attr('transform');
			const translateRegex = /translate\(([\d.]+),\s*([\d.]+)\)/;
			const translateMatch = transform.match(translateRegex);
			const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
			const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
			const currentRotation = parseFloat(value.attr('data-rotation')) || 0;

			const width = parseInt(value.select('rect').attr('width'));
			const height = parseInt(value.select('rect').attr('height'));
			const radius = parseInt(value.select('rect').attr('rx'));
			const price = parseInt(value.attr('data-price')) || 0;
			const shape = {
				price: price,
				x: translateX,
				y: translateY,
				width: width,
				height: height,
				rotation: currentRotation,
				radius: radius,
				isSelectable: Boolean(value.attr('data-isSelectable')) || false
			};
			shapesModel.push(shape);
		});

		const { data, error } = await supabase.rpc('insert_seat_layout_and_seats', {
			layout_data: { name: 'aaa', exhibition: 1 },
			seats_data: shapesModel
		});
		console.log('data', data);
		console.log('error', error);

		console.log('onSave', data);
	}

	$: {
		seatItemId = $seatItemStore.id;
		isSelectable = $seatItemStore.isSelectable;
		itemWidth = $seatItemStore.width != null ? $seatItemStore.width.toString() : undefined;
		itemHeight = $seatItemStore.height != null ? $seatItemStore.height.toString() : undefined;
		itemX = $seatItemStore.x != null ? $seatItemStore.x.toString() : undefined;
		itemPrice = $seatItemStore.price != null ? $seatItemStore.price.toString() : undefined;
		console.log('$seatItemStore.rotation ', $seatItemStore.rotation);
		itemRotation = $seatItemStore.rotation != null ? $seatItemStore.rotation.toString() : undefined;
	}

	function onIsSelectable(value: any) {
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.attr('data-isSelectable', value.target.checked);
		const seatItemData = getSeatItemData(seatItemId!, d3);
		console.log('seatItemData', seatItemData);
		seatItemStore.setItem(seatItemData);
	}

	function onItemWidthChange(value: any) {
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.select('rect').attr('width', value.target.value);

		const seatItemData = getSeatItemData(seatItemId!, d3);
		console.log('seatItemData', seatItemData);
		seatItemStore.setItem(seatItemData);
		changeRotationPostion(seatItemData.width, seatItemData.height);
	}
	function onItemHeightChange(value: any) {
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.select('rect').attr('height', value.target.value);

		const seatItemData = getSeatItemData(seatItemId!, d3);
		console.log('seatItemData', seatItemData);
		seatItemStore.setItem(seatItemData);
		changeRotationPostion(seatItemData.width, seatItemData.height);
	}

	function changeRotationPostion(newWidth: number, newHeight: number) {
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
		seatItem.select('.rotate-handle').attr('cx', newWidth / 2);
	}

	function onItemRotationChange(value: any) {
		const rotation = value.target.value;
		const seatItem = d3.select(`#${seatItemId}`);
		let seatItemData = getSeatItemData(seatItemId!, d3);
		seatItem.attr('data-rotation', rotation);
		seatItem.attr(
			'transform',
			`translate(${seatItemData.x},${seatItemData.y}) rotate(${seatItemData.rotation},${
				seatItemData.width / 2
			},${seatItemData.height / 2})`
		);
		seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}

	function onItemXPositionChange(value: any) {
		const positionX = value.target.value;
		const seatItem = d3.select(`#${seatItemId}`);
		const transform = seatItem.attr('transform');
		const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;
		const translateMatch = transform.match(translateRegex);
		const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
		const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
		let seatItemData = getSeatItemData(seatItemId!, d3);
		console.log('seatItemData', seatItemData);
		seatItem.attr(
			'transform',
			`translate(${positionX},${translateY}) rotate(${seatItemData.rotation},${
				seatItemData.width / 2
			},${seatItemData.height / 2})`
		);
		seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}

	function onItemPriceChange(value: any) {
		const price = value.target.value;
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.attr('data-price', price);

		let seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}
</script>

<div class="flex flex-col space-y-2 p-4 w-1/5 justify-between">
	<div class=" flex flex-col w-full h-60 justify-around">
		<Toggle
			disabled={seatItemId !== null && seatItemId !== undefined ? false : true}
			checked={isSelectable}
			on:change={onIsSelectable}>Selectable</Toggle
		>
		{#if isSelectable}
			<ButtonGroup class="w-full" size="sm">
				<InputAddon>Price</InputAddon>
				<Input
					disabled={!isSelectable}
					value={itemPrice}
					on:input={onItemPriceChange}
					size="sm"
					type="number"
					let:props
				/></ButtonGroup
			>
		{/if}

		<div>Section</div>
		<div class=" flex justify-around">
			<div class="w-24">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>X</InputAddon>
					<Input
						disabled={itemX === null || itemX === undefined || itemX === '' ? true : false}
						value={itemX}
						on:input={onItemXPositionChange}
						size="sm"
						type="number"
						let:props
					/>
				</ButtonGroup>
			</div>

			<div class="w-24">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>Y</InputAddon><Input
						bind:value={selectedSeatProperty.y}
						size="sm"
						let:props
					/></ButtonGroup
				>
			</div>
		</div>
		<div class=" flex justify-around">
			<div class="w-24">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>W</InputAddon>
					<Input
						disabled={itemWidth === null || itemWidth === undefined || itemWidth === ''
							? true
							: false}
						value={itemWidth}
						on:input={onItemWidthChange}
						size="sm"
						type="number"
						let:props
					/></ButtonGroup
				>
			</div>

			<div class="w-24">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>H</InputAddon>
					<Input
						disabled={itemHeight === null || itemHeight === undefined || itemHeight === ''
							? true
							: false}
						value={itemHeight}
						on:input={onItemHeightChange}
						size="sm"
						type="number"
						let:props
					/></ButtonGroup
				>
			</div>
		</div>
		<div class=" flex justify-around">
			<div class="w-24">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>(</InputAddon><Input
						type="number"
						bind:value={selectedSeatProperty.radius}
						size="sm"
						placeholder="Radius"
						let:props
					/></ButtonGroup
				>
			</div>
			<div class="w-24">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon><ArrowPath size="14" /></InputAddon><Input
						type="number"
						disabled={itemRotation === null || itemRotation === undefined || itemRotation === ''}
						size="sm"
						value={itemRotation}
						on:input={onItemRotationChange}
						placeholder="Rotation"
						let:props
					/></ButtonGroup
				>
			</div>
		</div>
	</div>
	<Button gradient color="cyan" on:click={onSave} class="bg-info">Save</Button>
</div>
