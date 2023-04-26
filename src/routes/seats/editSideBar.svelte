<script lang="ts">
	import { Button, ButtonGroup, Input, InputAddon, Toggle } from 'flowbite-svelte';
	import { ArrowPath } from 'svelte-heros-v2';
	import type { ItemPropertyModel } from '../../models/itemPropertyModel';
	import * as d3 from 'd3';
	import { seatItemStore } from './seatItemStore';
	import { getSeatItemData } from './seatDesignUtils';

	export let placeHolder: string;
	let selectedSeatItem: string;
	let isSelectable = false;
	let itemWidth: string | undefined;
	let itemHeight: string | undefined;
	let itemRadius: string | undefined;
	let itemRotation: string | undefined;

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

	function onSave() {
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
			const shape = {
				x: translateX,
				y: translateY,
				width: width,
				height: height,
				rotation: currentRotation,
				radius: radius,
				isSelectable: Boolean(value.attr('data-isSelectable')) || false,
				isMovable: value.attr('data-isMovable')
			};
			shapesModel.push(shape);
		});

		console.log('onSave', shapesModel);
	}

	$: {
		seatItemId = $seatItemStore.id;
		isSelectable = $seatItemStore.isSelectable;
		itemWidth = $seatItemStore.width != null ? $seatItemStore.width.toString() : undefined;
		itemHeight = $seatItemStore.height != null ? $seatItemStore.height.toString() : undefined;
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
        console.log('onItemWidthChange', value.target.value);
        const seatItem = d3.select(`#${seatItemId}`);
        seatItem.select('rect').attr('width', value.target.value);

        const seatItemData = getSeatItemData(seatItemId!, d3);
        console.log('seatItemData', seatItemData);
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

		<div>Section</div>
		<div class=" flex justify-around">
			<div class="w-24">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>X</InputAddon>
					<Input bind:value={selectedSeatProperty.x} size="sm" let:props />
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
						bind:value={itemWidth}
						on:change={onItemWidthChange}
						size="sm"
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
						bind:value={itemHeight}
						size="sm"
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
						bind:value={itemRotation}
						disabled={itemRotation === null || itemRotation === undefined || itemRotation === ''}
						size="sm"
						placeholder="Rotation"
						let:props
					/></ButtonGroup
				>
			</div>
		</div>
	</div>
	<Button gradient color="cyan" on:click={onSave} class="bg-info">Save</Button>
</div>
