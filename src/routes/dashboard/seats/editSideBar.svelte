<script lang="ts">
	import { Button, ButtonGroup, Input, InputAddon, Toggle } from 'flowbite-svelte';
	import { ArrowPath } from 'svelte-heros-v2';
	import * as d3 from 'd3';
	import { seatItemStore } from './seatItemStore';
	import { getSeatItemData } from './seatDesignUtils';
	import type { ItemPropertyModel } from '../../../models/itemPropertyModel';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { supabaseStore } from '../../../stores/supabaseStore';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { seatLayoutStore, type SeatLayoutModel, type SeatDesignModel } from './seatLayoutStore';
	import { showSelectedDesign } from './seatDesignFromExsiting';
	import html2canvas from 'html2canvas';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { Canvg } from 'canvg';

	export let placeHolder: string;
	export let seatLayoutModel: SeatLayoutModel | undefined;

	let seatLayoutId: number | undefined;
	let selectedSeatItem: string;
	let isSelectable = false;
	let itemWidth: string | undefined;
	let itemHeight: string | undefined;
	let itemRadius: string | undefined;
	let itemRotation: string | undefined;
	let itemX: string | undefined;
	let itemY: string | undefined;
	let itemPrice: string | undefined;
	let fillColor: any;
	let strokeColor: any;
	let strokeWidth: string | undefined;
	let seatLayoutName: string | undefined;
	let supabase: SupabaseClient<any, 'public', any> | null;

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

	onMount(() => {
		// get seat layout id from url
		supabase = $supabaseStore;
		const id = $page.params.id;
		if (id) {
			seatLayoutId = parseInt(id);
		}
		if (seatLayoutModel) {
			seatLayoutName = seatLayoutModel.name;
		}
	});

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

				const radius =
					typeof selectedSeatProperty.radius === 'number'
						? selectedSeatProperty.radius
						: parseInt(selectedSeatProperty.radius);

				if (parseInt(value.select('rect').attr('rx')) != radius) {
					value.select('rect').attr('rx', radius);
					value.select('rect').attr('ry', radius);
				}

				if (parseFloat(value.attr('data-rotation')) !== selectedSeatProperty.rotation) {
					const transform = value.attr('transform');
					const translateRegex = /translate\(([\d.]+),\s*([\d.]+)\)/;
					const translateMatch = transform.match(translateRegex);
					const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
					const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
					const centerX = width / 2;
					const centerY = height / 2;
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
		const supabase = $supabaseStore;
		if (!supabase) return;
		let shapesModel: any[] = [];
		const svgShapes = d3.select(placeHolder).selectAll('g');

		const container = d3.select('.svgPlaceholder');
		const uiImageUrl = await convertUiToImage();
		if (!uiImageUrl) {
			alert('Something went wrong, please try again');
			return;
		}
		// get contianer width and height
		const htmlElemtn = container.node() as HTMLElement;

		const containerWidth = htmlElemtn.clientWidth;
		const containerHeight = htmlElemtn.clientHeight;
		// convert all svg shapes to shapes model
		svgShapes.each(function (d, i) {
			const value = d3.select(this);
			const transform = value.attr('transform');
			const translateRegex = /translate\(([\d.]+),\s*([\d.]+)\)/;
			const translateMatch = transform.match(translateRegex);
			const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
			const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
			// x y as a percentage of the container
			const xPercentage = (translateX / containerWidth) * 100;
			const yPercentage = (translateY / containerHeight) * 100;
			const currentRotation = parseFloat(value.attr('data-rotation')) || 0;
			const fillColor = value.select('rect').attr('fill');
			const width = parseInt(value.select('rect').attr('width'));
			const height = parseInt(value.select('rect').attr('height'));
			const strokeColor = value.select('rect').attr('stroke');
			const strokeWidth = value.select('rect').attr('stroke-width');
			let imageUrl = '';

			// if it has image
			if (value.select('pattern').node() && value.select('image').node()) {
				imageUrl = value.select('image').attr('href') || '';
			}
			// width and height as a percentage of the container
			const widthPercentage = (width / containerWidth) * 100;
			const heightPercentage = (height / containerHeight) * 100;
			const radius = parseInt(value.select('rect').attr('rx'));
			const price = parseInt(value.attr('data-price')) || 0;
			const shape = {
				fill_color: fillColor,
				image_url: imageUrl,
				price: price,
				x: xPercentage,
				y: yPercentage,
				width: widthPercentage,
				height: heightPercentage,
				rotation: currentRotation,
				border_radius: radius,
				stroke_color: strokeColor,
				stroke_width: strokeWidth,
				radius: radius,
				is_selectable: Boolean(value.attr('data-isSelectable')) || false
			};
			shapesModel.push(shape);
		});
		const data: SeatLayoutModel = {
			id: seatLayoutId,
			name: seatLayoutName!,
			image_url: uiImageUrl,
			exhibition: 1,
			aspect_ratio: undefined,
			seats: shapesModel
		};
		if (seatLayoutId) {
			seatLayoutStore.saveData(data, supabase);
		} else {
			seatLayoutStore.saveData(data, supabase);
		}
	}

	$: {
		seatItemId = $seatItemStore.id;
		isSelectable = $seatItemStore.isSelectable;
		itemWidth = $seatItemStore.width != null ? $seatItemStore.width.toString() : undefined;
		itemHeight = $seatItemStore.height != null ? $seatItemStore.height.toString() : undefined;
		itemX = $seatItemStore.x != null ? $seatItemStore.x.toString() : undefined;
		itemY = $seatItemStore.y != null ? $seatItemStore.y.toString() : undefined;
		itemPrice = $seatItemStore.price != null ? $seatItemStore.price.toString() : undefined;
		itemRotation = $seatItemStore.rotation != null ? $seatItemStore.rotation.toString() : undefined;
		itemRadius = $seatItemStore.radius != null ? $seatItemStore.radius.toString() : undefined;
		strokeWidth =
			$seatItemStore.strokeWidth != null ? $seatItemStore.strokeWidth.toString() : undefined;
		fillColor = $seatItemStore.fillColor;
	}

	function onIsSelectable(value: any) {
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.attr('data-isSelectable', value.target.checked);
		const seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}

	function onItemWidthChange(value: any) {
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.select('rect').attr('width', value.target.value);

		const seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
		changeRotationPostion(seatItemData.width, seatItemData.height);
	}
	function onItemHeightChange(value: any) {
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.select('rect').attr('height', value.target.value);

		const seatItemData = getSeatItemData(seatItemId!, d3);
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
		seatItem.attr(
			'transform',
			`translate(${positionX},${translateY}) rotate(${seatItemData.rotation},${
				seatItemData.width / 2
			},${seatItemData.height / 2})`
		);
		seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}

	function onItemYPositionChange(value: any) {
		const positionY = value.target.value;
		const seatItem = d3.select(`#${seatItemId}`);
		const transform = seatItem.attr('transform');
		const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;
		const translateMatch = transform.match(translateRegex);
		const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
		const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
		let seatItemData = getSeatItemData(seatItemId!, d3);
		seatItem.attr(
			'transform',
			`translate(${translateX},${positionY}) rotate(${seatItemData.rotation},${
				seatItemData.width / 2
			},${seatItemData.height / 2})`
		);
		seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}

	function onItemRadiusChange(value: any) {
		const radius = value.target.value;
		if (parseInt(radius) < 0) {
			itemRadius = '0';
			return;
		}
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.select('rect').attr('rx', radius);
		seatItem.select('rect').attr('ry', radius);

		const seatItemData = getSeatItemData(seatItemId!, d3);

		seatItemStore.setItem(seatItemData);
		changeRotationPostion(seatItemData.width, seatItemData.height);
	}

	function onItemPriceChange(value: any) {
		const price = value.target.value;
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.attr('data-price', price);

		let seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}

	function onFillColorSelected(value: any) {
		if (value.detail && value.detail.hex) {
			const color = value.detail.hex;
			const seatItem = d3.select(`#${seatItemId}`);
			seatItem.select('rect').attr('fill', color);
			let seatItemData = getSeatItemData(seatItemId!, d3);
			seatItemStore.setItem(seatItemData);
		}
	}

	function onStrokeColorSelected(value: any) {
		if (value.detail && value.detail.hex) {
			const color = value.detail.hex;
			const seatItem = d3.select(`#${seatItemId}`);
			seatItem.select('rect').attr('stroke', color);
			let seatItemData = getSeatItemData(seatItemId!, d3);
			seatItemStore.setItem(seatItemData);
		}
	}

	function onItemStrokeWidthChange(value: any) {
		const strokeWidth = value.target.value;
		const seatItem = d3.select(`#${seatItemId}`);
		seatItem.select('rect').attr('stroke-width', strokeWidth);
		let seatItemData = getSeatItemData(seatItemId!, d3);
		seatItemStore.setItem(seatItemData);
	}

	function onInputName(value: any) {
		const name = value.target.value;
		seatLayoutName = name;
	}

	async function convertUiToImage(): Promise<string | null> {
		if (!supabase) return null;
		const svg = document.getElementById('svgContainer');
		const svgData = new XMLSerializer().serializeToString(svg!);
		const canvas = document.createElement('canvas');
		const ramndomName = Math.random().toString(36).substring(7);
		const randomImageName = `${seatLayoutName}_${ramndomName}`;
		const canvgInstance = await Canvg.fromString(canvas.getContext('2d')!, svgData);
		canvgInstance.start();
		const imageDataUrl = canvas.toDataURL('image/png');
		const imageData = dataURLToBlob(imageDataUrl);
		const imageFile = new File([imageData], `${randomImageName}.png`, {
			type: 'image/png'
		});
		const { data, error } = await supabase.storage
			.from('image')
			.upload(`images/${imageFile.name}`, imageFile, {
				cacheControl: '3600',
				upsert: false
			});

		if (error) {
			return null;
		} else {
			const imageUrl = data?.path;
			return imageUrl;
		}
	}

	function dataURLToBlob(dataUrl: any) {
		const byteString = atob(dataUrl.split(',')[1]);
		const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
		const arrayBuffer = new ArrayBuffer(byteString.length);
		const u8Array = new Uint8Array(arrayBuffer);

		for (let i = 0; i < byteString.length; i++) {
			u8Array[i] = byteString.charCodeAt(i);
		}

		return new Blob([arrayBuffer], { type: mimeString });
	}
</script>

<div class="flex flex-col space-y-2 p-4 w-1/5 justify-between">
	<div class=" flex flex-col w-full justify-around h-128">
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
						disabled={itemY === null || itemY === undefined || itemY === '' ? true : false}
						value={itemY}
						on:input={onItemYPositionChange}
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
						disabled={itemRadius === null || itemRadius === undefined || itemRadius === ''}
						size="sm"
						value={itemRadius}
						on:input={onItemRadiusChange}
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
		<div />
		<div class="flex flex-col mt-8">
			<div class="text-sm">Fill Color</div>
			<ColorPicker on:input={onFillColorSelected} hex={fillColor} />
		</div>
		<div class="flex flex-col">
			<div class="text-sm">Stroke Color</div>
			<ColorPicker on:input={onStrokeColorSelected} hex={strokeColor} />
			<div class="w-1/2">
				<ButtonGroup class="w-full" size="sm">
					<InputAddon>Stroke</InputAddon><Input
						type="number"
						disabled={seatItemId === null || seatItemId === undefined || seatItemId === ''}
						size="sm"
						value={strokeWidth}
						on:input={onItemStrokeWidthChange}
						placeholder="Rotation"
						let:props
					/></ButtonGroup
				>
			</div>
		</div>
	</div>
	<div class="flex flex-col h-32 justify-between">
		<ButtonGroup class="w-full" size="sm">
			<Input
				type="text"
				size="sm"
				on:input={onInputName}
				bind:value={seatLayoutName}
				placeholder="Name"
				let:props
			/></ButtonGroup
		>
		<Button gradient color="cyan" on:click={onSave} class="bg-info">Save</Button>
	</div>
</div>

<style>
	.container .svelte-2ybi8r {
		width: 50% !important;
		height: 50% !important;
	}
</style>
