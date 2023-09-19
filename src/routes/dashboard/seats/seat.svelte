<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import SeatDesignSideBar from './seatDesignSideBar.svelte';
	import EditSideBar from './editSideBar.svelte';
	import { seatItemStore } from './seatItemStore';
	import { Button, ButtonGroup, Fileupload, Input, InputAddon, P } from 'flowbite-svelte';
	import { Lottie } from 'lottie-svelte';
	import { Direction } from 'lottie-svelte/iface';
	import { seatLayoutStore, type SeatDesignModel, type SeatLayoutModel } from './seatLayoutStore';
	import { showSelectedDesign } from './seatDesignFromExsiting';
	import { createRandomString } from '$lib/utils/createRandom';
	import Panzoom from '@panzoom/panzoom';

	let selected: any;
	let value: any;
	let selectedAreaSize: number | undefined;
	let imgSrc: string = '';
	let seats: d3.Selection<SVGGElement, unknown, null, undefined>;
	let dragEnded = true;
	let svg: any;
	let seatLayoutModel: SeatLayoutModel | undefined;

	function draggedImage(event: any, seatGroup: d3.Selection<SVGGElement, any, any, any>) {
		const currentRotation = parseInt(seatGroup.attr('data-rotation') || '0');
		const rectElement = seatGroup.select('image').node() as SVGRectElement;
		const bbox = rectElement.getBBox();

		const halfCurrentWidth = bbox.width / 2;
		const halfCurrentHeight = bbox.height / 2;

		const centerX = event.x - halfCurrentWidth;
		const centerY = event.y - halfCurrentHeight;

		seatGroup.attr(
			'transform',
			`translate(${centerX},${centerY}) rotate(${currentRotation},${halfCurrentWidth},${halfCurrentHeight})`
		);

		// Show the rotated element again after the drag is complete
	}
	let isLoaded = false;

	onMount(() => {
		if ($seatLayoutStore) {
			seatLayoutModel = $seatLayoutStore;
			if (seatLayoutModel.id) {
				selectedAreaSize = seatLayoutModel.aspect_ratio;
				showSelectedDesign(seatLayoutModel, d3, '.svgPlaceholder');
			}
		}

		seats = d3.select(svg).append('g').attr('class', 'seats');
		isLoaded = true;
		// lines = d3.select(svg).append('g').attr('class', 'lines');
		// path = d3.select(svg).append('g').attr('class', 'path');

		// const drag = d3
		// 	.drag()
		// 	.subject((event) => event.subject)
		// 	.on('start', dragstarted)
		// 	.on('drag', dragged)
		// 	.on('end', dragended);

		// if (clonedSeat != null) {
		// 	clonedSeat.node().appendChild(rotationIndicator.node());
		// }
	});

	function drawLine(x1: number, y1: number, x2: number, y2: number) {
		lines
			.append('line')
			.attr('x1', x1)
			.attr('y1', y1)
			.attr('x2', x2)
			.attr('y2', y2)
			.attr('stroke', 'black')
			.attr('stroke-width', 2);
	}
	function resizeImage(
		event: d3.D3DragEvent<any, any, any>,
		seatGroup: d3.Selection<SVGGElement, any, any, any>
	) {
		const newWidth = Math.max(20, event.x);
		const newHeight = Math.max(20, event.y);
		seatGroup.select('image').attr('width', newWidth).attr('height', newHeight);

		seatGroup.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
	}

	$: {
		if (selected) {
			const clonedImage: d3.Selection<SVGGElement, any, any, any> = seats
				.append('g')
				.datum(d)
				.attr('transform', `translate(20,20)`)
				.attr('data-rotation', '0')
				.call(d3.drag().on('drag', (event) => draggedImage(event, clonedImage)) as any)
				.on('click', (event, d) => {});
			// clonedImage
			// 	.append('rect')
			// 	.attr('width', 20)
			// 	.attr('height', 20)
			// 	// fill color
			// 	.attr('fill', `#${Math.floor(Math.random() * 16777215).toString(16)}`)
			// 	.attr('rx', 1)
			// 	.attr('ry', 1);
			clonedImage
				.append('image')
				.attr('width', 20)
				.attr('height', 20)
				.attr('preserveAspectRatio', 'none')
				.attr('xlink:href', selected)
				.attr('transform', `translate(20,20)`);

			clonedImage
				.append('circle')
				.attr('class', 'resize-handle')
				.attr('cx', seatWidth)
				.attr('cy', seatHeight)
				.attr('r', 5)
				.attr('fill', 'green')
				.call(
					d3.drag().on('drag', (event) => {
						resizeImage(event, clonedImage);
						selectedItem(clonedImage, 'image');
					}) as any
				);
			// fill color
		}
	}

	let currentSelectedG;
	const seatWidth = 50;
	const seatHeight = 50;
	let lines: d3.Selection<SVGGElement, unknown, null, undefined>;
	let d = '';
	let paths: string[] = [];
	let group: any;
	let currentPath: string = '';

	let radiusInput = '';

	let currentLine: d3.Selection<SVGLineElement, any, any, any> | null = null;

	function resetSelectedSeat(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('rect')) {
		} else {
			const seatGroup = d3.select(target.closest('g')) as d3.Selection<SVGGElement, any, any, any>;
			if (seatGroup) {
				selectedItem(seatGroup);
			}
		}
	}
	let startPoint: any = null;
	let firstPoint: any = null;
	let linePreview: any = null;
	function distanceBetweenPoints(point1: any, point2: any) {
		const dx = point1.x - point2.x;
		const dy = point1.y - point2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function onMouseDown(event: MouseEvent) {
		const currentPoint = { x: event.offsetX, y: event.offsetY };
		seatItemStore.reset(d3);

		if (firstPoint && distanceBetweenPoints(firstPoint, currentPoint) <= 50) {
			// 10 is the threshold value
			// Close the shape

			const line = `M ${firstPoint.x} ${firstPoint.y} L ${currentPoint.x} ${currentPoint.y}`;
			paths.push(line);

			// // Connect the last point to the first point
			// const connectLine = `M ${currentPoint.x} ${currentPoint.y} L ${firstPoint[1]} ${firstPoint[2]}`;
			// paths.push(connectLine);

			group
				.selectAll('path')
				.data(paths)
				.join('path')
				.attr('d', (d: any) => d)
				.attr('fill', 'none')
				.attr('stroke', 'black')
				.attr('stroke-dasharray', '0')
				.attr('stroke-width', 2);

			// Remove the starting point circle and line preview
			group.selectAll('circle').remove();
			if (linePreview) {
				linePreview.remove();
				linePreview = null;
			}

			// Reset the startPoint
			startPoint = null;
		} else {
			if (!startPoint) {
				paths = [];
				startPoint = { x: event.offsetX, y: event.offsetY };
				firstPoint = { x: event.offsetX, y: event.offsetY };

				const randomNmaeText = createRandomString();

				group = d3.select(svg).append('g').attr('id', randomNmaeText);
				// .attr('transform', `translate(${5},${5}) `);

				// seatGroup
				// 	.select('text')
				// 	.attr('x', newWidth / 2)
				// 	.attr('y', newHeight / 2);
				// if (seatGroup.select('pattern').node() && seatGroup.select('image').node()) {
				// 	seatGroup.select('pattern').attr('width', newWidth).attr('height', newHeight);
				// 	seatGroup.select('image').attr('width', newWidth).attr('height', newHeight);
				// }
				// seatGroup.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
				// seatGroup.select('.rotate-handle').attr('cx', newWidth / 2);

				// selectSeatItem(randomId);

				// path
				// 	.append('rect')
				// 	.attr('width', seatWidth)
				// 	.attr('height', seatHeight)
				// 	// fill color
				// 	.attr('fill', '#000')
				// 	.attr('stroke', '#000')
				// 	.attr('stroke-width', 0)
				// 	.attr('rx', 0)
				// 	.attr('ry', 0)
				// 	.on('click', function () {});

				// Add a circle at the starting point
				// group
				// 	.append('circle')
				// 	.attr('class', 'point-circle')
				// 	.attr('cx', 5)
				// 	.attr('cy', 5)
				// 	.attr('r', 3)
				// 	.attr('fill', 'black');
			} else {
				const line = `M ${startPoint.x} ${startPoint.y} L ${event.offsetX} ${event.offsetY}`;

				paths.push(line); // Add the line to the existing paths
				group
					.selectAll('path')
					.data(paths) // Update with the existing paths
					.join('path')
					.attr('d', (d: any) => d)
					.attr('fill', 'none')
					.attr('stroke', 'black')
					.attr('stroke-dasharray', '0')
					.attr('stroke-width', 2);

				// Remove the starting point circle and line preview
				group.selectAll('.point-circle').remove();
				linePreview = null;
				startPoint = { x: event.offsetX, y: event.offsetY };

				// Add a circle at the new starting point
				group
					.append('circle')
					.attr('class', 'point-circle')
					.attr('cx', startPoint.x)
					.attr('cy', startPoint.y)
					.attr('r', 3)
					.attr('fill', 'black');
			}
		}

		resetSelectedSeat(event);
	}

	function onMouseMove(event: MouseEvent) {
		//
		if (startPoint) {
			// Update line preview
			const previewLine = `M ${startPoint.x} ${startPoint.y} L ${event.offsetX} ${event.offsetY}`;
			if (!linePreview) {
				linePreview = group
					.append('path')
					.attr('stroke', 'black')
					.attr('stroke-width', 2)
					.attr('stroke-dasharray', '5,5');
			}
			linePreview.attr('d', previewLine);
		}
	}

	function onEscKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			// width of the group
			// height of the group
			// x of the group
			// y of the group
			linePreview.remove();
			linePreview = null;
			const groupWidth = group.node().getBoundingClientRect().width;
			const groupHeight = group.node().getBoundingClientRect().height;
			const groupX = group.node().getBoundingClientRect().x;
			const groupY = group.node().getBoundingClientRect().y;

			// get group postion relative to svg
			const groupXX = group.node().getBoundingClientRect().x - svg.getBoundingClientRect().x;
			const groupYY = group.node().getBoundingClientRect().y - svg.getBoundingClientRect().y;

			// get all path and subtract the group position

			// get all path and subtract the group position
			const paths = group.selectAll('path').nodes();

			paths.forEach((path: any) => {
				// get d attribute
				const d = path.getAttribute('d');
				// seperate the d attribute
				const dArray = d.split(' ');
				// get the x and y of the first point
				const x = dArray[1];
				const y = dArray[2];

				// get destination x and y
				const destX = dArray[4];
				const destY = dArray[5];
				// get the new x and y
				const newX = x - groupXX;
				const newY = y - groupYY;

				// get the new destination x and y
				const newDestX = destX - groupXX;
				const newDestY = destY - groupYY;

				// update the d attribute
				path.setAttribute('d', `M ${newX} ${newY} L ${newDestX} ${newDestY}`);
			});

			group.attr('transform', `translate(${groupXX},${groupYY}) `);

			// random string with number
			const randomString = Math.random().toString(36).substring(7);
			const rectId = createRandomString();
			group
				.append('rect')
				.attr('id', rectId)
				.attr('width', groupWidth)
				.attr('height', groupHeight)
				.attr('fill', 'none')
				.attr('stroke', 'black')
				.attr('stroke-width', 2);

			// Add a circle at the starting point

			const groupId = group.attr('id');

			group
				.append('circle')
				.attr('class', 'resize-handle')
				.attr('cx', groupWidth)
				.attr('cy', groupHeight)
				.attr('r', 5)
				.attr('fill', 'green')
				.attr('style', 'display:inherit')
				.call(
					d3.drag().on('drag', (event: any) => {
						resize(event, groupId);
					}) as any
				);

			group.selectAll('.point-circle').remove();
			group = null;
			currentLine = null;
			startPoint = null;
			// penSelected = false;
		}
	}

	function selectedItem(
		item: d3.Selection<SVGGElement, any, any, any>,
		image: string | null = null
	) {
		let seatGroup;

		if (image == 'image') {
			seatGroup = item.select('image');
		} else {
			seatGroup = item.select('rect');
		}
		const currentSeatGroup = d3.select(item.node());
		const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;

		const transform = currentSeatGroup.attr('transform');
		const translateMatch = transform.match(translateRegex);
		const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
		const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
	}

	// window.addEventListener('keydown', onEscKey);
	function numberBinding(node: any, value: any) {
		node.value = value;
		node.addEventListener('input', () => {
			value = parseFloat(node.value) || 0;
			node.dispatchEvent(new CustomEvent('numberinput', { detail: value }));
		});

		return {
			update(newValue: any) {
				if (newValue !== value) {
					node.value = newValue;
					value = newValue;
				}
			},
			destroy() {
				node.removeEventListener('input', numberBinding);
			}
		};
	}

	enum AreaType {
		square = 1,
		rectangle = 0.5625,
		rectangle2 = 1.25
	}

	// function onMouseWeel(event: any) {
	// 	const svgSelection: any = d3.select('#svgContainer');
	//
	// 	const y = event.deltaY;
	//
	// 	svgSelection.attr('transform', `scale(${y})`);

	// 	const zoom = d3
	// 		.zoom()
	// 		.scaleExtent([0.5, 20]) // This controls the minimum and maximum zoom levels
	// 		.on('zoom', (event) => {
	// 			svg.attr('transform', event.transform);
	// 		});

	// 	if (event.ctrlKey) {
	// 		event.preventDefault(); // Prevent browser's default zoom on Ctrl+Scroll
	// 		const point = d3.pointer(event, svgSelection.node());
	// 		const incomingZoom = event.deltaY > 0 ? 0.9 : 1.1;
	// 		const newScale = { k: svgSelection.property('__zoom').k * incomingZoom };
	// 		const transform = d3.zoomIdentity
	// 			.translate(point[0], point[1])
	// 			.scale(newScale.k)
	// 			.translate(-point[0], -point[1]);
	// 		svgSelection.call(zoom.transform, transform);
	// 	}
	// 	// weel event
	// }

	function onAreaSizeClick(areaType: AreaType) {
		selectedAreaSize = areaType;
		seatLayoutStore.setAreaSize(areaType);

		// // for example

		// // advanced usage
		// setTimeout(() => {
		// 	const elem = document.getElementById('container');
		//
		// 	const panzoom = Panzoom(elem!, {
		// 		maxScale: 5,
		// 		disablePan: false
		// 	});

		// 	panzoom.pan(10, 10);
		// 	panzoom.zoom(1, { animate: true });
		// 	elem!.parentElement!.addEventListener('wheel', (event) => {
		//
		// 		panzoom.zoomWithWheel(event);
		// 	});
		// }, 100);

		// select the svg area
	}

	async function onFileUpload(e: any) {
		const file = e.target.files[0] as File;
		const aspectRatio = await getImageAspectRatio(file);

		const reader = new FileReader();
		reader.onload = () => {
			imgSrc = reader.result as string;
			const container = document.getElementById('container');
			if (container) {
				container.style.backgroundImage = `url(${imgSrc})`;
				container.style.backgroundSize = 'cover';
				container.style.backgroundPosition = 'center';
			}
		};
		reader.readAsDataURL(file);
		selectedAreaSize = aspectRatio;
		seatLayoutStore.setAreaSize(selectedAreaSize);
	}

	function getImageAspectRatio(file: File): Promise<number> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event: any) => {
				const img = new Image();
				img.src = event.target.result as string;
				img.onload = () => {
					const aspectRatio = img.height / img.width;
					resolve(aspectRatio);
				};
				img.onerror = () => {
					reject(new Error('Failed to load the image.'));
				};
			};
			reader.onerror = () => {
				reject(new Error('Failed to read the file.'));
			};
			reader.readAsDataURL(file);
		});
	}

	function resize(event: any, groupId: string) {
		const newWidth = Math.max(20, event.x);
		const newHeight = Math.max(20, event.y);

		const group = d3.select(svg).select(`#${groupId}`);
		const rect = group.select('rect');
		const rectWidth = rect.attr('width');
		const rectHeight = rect.attr('height');

		// calculate the percentage change in width and height

		const percChangeWidth = newWidth / parseFloat(rectWidth);
		const percChangeHeight = newHeight / parseFloat(rectHeight);

		// ... the rest of your function ...
		const paths = group.selectAll('path');
		paths.each(function (d, i) {
			const path = d3.select(this);
			const pathD = path.attr('d');
			const pathDArray = pathD.split(' ');

			const x = pathDArray[1];
			const y = pathDArray[2];

			// new x and y

			const newX = parseFloat(x) * percChangeWidth;
			const newY = parseFloat(y) * percChangeHeight;

			// get destination x and y
			const destX = pathDArray[4];
			const destY = pathDArray[5];

			const newDestX = parseFloat(destX) * percChangeWidth;
			const newDestY = parseFloat(destY) * percChangeHeight;

			const newPathD = `M ${newX} ${newY} L ${newDestX} ${newDestY}`;

			path.attr('d', newPathD);
		});
		rect.attr('width', newWidth).attr('height', newHeight);
		group.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
	}
</script>

<svelte:window on:keydown={onEscKey} />
{#if isLoaded}
	<div class="h-screen flex" style="height: calc(100vh - 150px);">
		<SeatDesignSideBar placeHolder={'.svgPlaceholder'} />
		<div class="flex-1 relative">
			{#if selectedAreaSize}
				<div
					id="container"
					class=" relative w-full overflow-scroll border-black border-4"
					style={`padding-bottom: calc(${selectedAreaSize} * 100%);`}
				>
					<svg
						id="svgContainer"
						on:mousedown={onMouseDown}
						on:mousemove={onMouseMove}
						bind:this={svg}
						class="absolute top-0 left-0 w-full h-full border-gray border-4 svgPlaceholder"
						xmlns="http://www.w3.org/2000/svg"
					/>
				</div>
			{:else}
				<div class="w-full h-full flex flex-col justify-center items-center">
					<!-- <Lottie
						path="./love.json"
						autoplay={true}
						loop={false}
						speed={0.2}
						direction={Direction.REVERSE}
					/> -->
					<div class="mb-2">Please select the aspect ratio of seats holder first</div>
					<ButtonGroup>
						<Button on:click={() => onAreaSizeClick(AreaType.square)} outline color="dark"
							>Square 1:1</Button
						>
						<Button on:click={() => onAreaSizeClick(AreaType.rectangle)} outline color="dark"
							>Rectangle 16:9</Button
						>
						<Button on:click={() => onAreaSizeClick(AreaType.rectangle2)} outline color="dark"
							>Rectangle 4:5</Button
						>
					</ButtonGroup>
					<div>
						<Fileupload bind:value on:change={onFileUpload} />
					</div>
				</div>
			{/if}

			<!-- <svg
				on:mousedown={onMouseDown}
				on:mousemove={onMouseMove}
				bind:this={svg}
				class={'w-full h-full border svgPlaceholder '}
				xmlns="http://www.w3.org/2000/svg"
			/> -->
		</div>
		<EditSideBar placeHolder={'.svgPlaceholder'} {seatLayoutModel} />
	</div>
{/if}
