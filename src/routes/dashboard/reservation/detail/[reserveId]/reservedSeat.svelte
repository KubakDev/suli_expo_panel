<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { ReservationStatusEnum } from '../../../../../models/reservationEnum';
	import { browser } from '$app/environment';

	export let data: any;
	export let reservations: any = [];
	let d3: any;
	let svg: any;
	let container: HTMLElement;
	let activeSeat: any = null;

	$: {
		if (container && activeSeat) {
			adjustViewBox();
		}
	}

	onMount(async () => {
		if (browser) {
			d3 = await import('d3');
			if (data) {
				activeSeat = data.find((item: any) => item.is_active === true);
				if (activeSeat) {
					await tick();
					await loadSeats();
				}
			}
		}
	});

	const adjustViewBox = () => {
		const width = activeSeat?.design?.width;
		const height = activeSeat?.design?.height;
		const containerWidth = container?.offsetWidth;
		const aspectRatio = width / height;

		// Calculate the maximum width and height to fit in the container
		let targetWidth = containerWidth;
		let targetHeight = containerWidth / aspectRatio;

		// If the height gets too large, constrain it
		const maxHeight = window.innerHeight * 0.8; // 80% of viewport height
		if (targetHeight > maxHeight) {
			targetHeight = maxHeight;
			targetWidth = targetHeight * aspectRatio;
		}

		if (container) {
			container.style.width = `${targetWidth}px`;
			container.style.height = `${targetHeight}px`;
			container.style.margin = '0 auto'; // Center the container
		}

		if (svg) {
			svg.attr('viewBox', `0 0 ${width} ${height}`)
				.attr('width', targetWidth)
				.attr('height', targetHeight)
				.attr('preserveAspectRatio', 'xMidYMid meet');
		}
	};

	const loadSeats = async () => {
		if (!activeSeat?.design?.objects) {
			console.error("No design objects found in the data!");
			return;
		}

		const width = activeSeat?.design?.width;
		const height = activeSeat?.design?.height;

		// Clear previous content
		d3.select('#seating-chart').selectAll('*').remove();
		
		// Set up SVG with responsive dimensions
		svg = d3.select('#seating-chart')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('preserveAspectRatio', 'xMidYMid meet');

		const mainGroup = svg.append('g');

		// Process and render objects
		activeSeat.design.objects.forEach((obj: any) => {
			const objId = String(obj.id);
			const reservedSeat = reservations.find(
				(seat: any) => String(seat.object_id) === objId
			);
  
			// Apply status colors directly to the object
			if (reservedSeat) {
				if (reservedSeat.status === ReservationStatusEnum.ACCEPT) {
					obj.fill = '#ff176b';
					obj.stroke = '#ff176b';
					obj.strokeWidth = 3;
				} else if (reservedSeat.status === ReservationStatusEnum.PENDING) {
					obj.fill = '#A0B0C2';
					obj.stroke = '#A0B0C2';
					obj.strokeWidth = 3;
				}
			}

			switch (obj.type) {
				case 'rect':
					renderRect(mainGroup, obj);
					break;
				case 'i-text':
					renderText(mainGroup, obj);
					break;
				case 'group':
					renderGroup(mainGroup, { ...obj, reservedSeat });
					break;
				case 'triangle':
					renderTriangle(mainGroup, obj);
					break;
				case 'circle':
					renderCircle(mainGroup, obj);
					break;
				case 'image':
					renderImage(mainGroup, obj);
					break;
				default:
					console.warn(`Unsupported object type: ${obj.type}`);
			}
		});
	};

	const renderRect = (group: any, obj: any) => {
	  
		const x = obj.left || 0;
		const y = obj.top || 0;
		const width = obj.width * (obj.scaleX || 1);
		const height = obj.height * (obj.scaleY || 1);

		const rectGroup = group.append('g')
			.attr('class', 'seat-container');

		rectGroup.append('rect')
			.attr('class', 'seat')
			.attr('x', x)
			.attr('y', y)
			.attr('width', width)
			.attr('height', height)
			.attr('fill', obj.fill || 'transparent')
			.attr('stroke', obj.stroke || '#000')
			.attr('stroke-width', obj.strokeWidth || 1)
			.attr('id', obj.id);

		// Add status text if seat is reserved
		const reservedSeat = reservations.find(
			(reservation: any) => String(reservation.object_id) === String(obj.id)
		);

		if (reservedSeat) {
			const statusText = reservedSeat.status === ReservationStatusEnum.ACCEPT ? 'Reserved' : 'Pending';
			rectGroup.append('text')
				.attr('x', x + width/2)
				.attr('y', y + height/2)
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('fill', '#ffffff')
				.attr('font-size', '12px')
				.attr('font-weight', 'bold')
				.text(statusText);
		}
	};

	const renderText = (group: any, obj: any) => {
		const x = obj.left;
		const y = obj.top;
		
		group.append('text')
			.attr('x', x)
			.attr('y', y + (obj.fontSize || 20))
			.attr('font-size', obj.fontSize || 20)
			.attr('font-family', obj.fontFamily || 'Times New Roman')
			.attr('fill', obj.fill || '#000')
			.text(obj.text || '')
			.attr('transform', obj.angle ? `rotate(${obj.angle}, ${x}, ${y})` : null);
	};

	const renderTriangle = (group: any, obj: any) => {
		const x = obj.left;
		const y = obj.top;
		const width = obj.width * (obj.scaleX || 1);
		const height = obj.height * (obj.scaleY || 1);
		
		const points = [
			`${x},${y + height}`,
			`${x + width/2},${y}`,
			`${x + width},${y + height}`
		].join(' ');
		
		group.append('polygon')
			.attr('points', points)
			.attr('fill', obj.fill || 'transparent')
			.attr('stroke', obj.stroke || 'none')
			.attr('stroke-width', obj.strokeWidth || 0)
			.attr('transform', obj.angle ? `rotate(${obj.angle}, ${x + width/2}, ${y + height/2})` : null);
	};

	const renderCircle = (group: any, obj: any) => {
		const x = obj.left || 0;
		const y = obj.top || 0;
		const radius = (obj.radius || 0) * (obj.scaleX || 1); // Scale radius if needed

		const circleGroup = group.append('g')
			.attr('class', 'seat-container');

		circleGroup.append('circle')
			.attr('class', 'seat')
			.attr('cx', x + radius) // Center x-coordinate
			.attr('cy', y + radius) // Center y-coordinate
			.attr('r', radius)
			.attr('fill', obj.fill || 'transparent')
			.attr('stroke', obj.stroke || '#000')
			.attr('stroke-width', obj.strokeWidth || 1)
			.attr('id', obj.id);

		// Add status text if seat is reserved
		const reservedSeat = reservations.find(
			(reservation: any) => String(reservation.object_id) === String(obj.id)
		);

		if (reservedSeat) {
			const statusText = reservedSeat.status === ReservationStatusEnum.ACCEPT ? 'Reserved' : 'Pending';
			circleGroup.append('text')
				.attr('x', x + radius)
				.attr('y', y + radius)
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('fill', '#ffffff')
				.attr('font-size', '12px')
				.attr('font-weight', 'bold')
				.text(statusText);
		}
	};

	const renderGroup = (group: any, obj: any) => {
		const groupElement = group.append('g')
			.attr('class', 'seat-group')
			.attr('transform', `translate(${obj.left || 0}, ${obj.top || 0})`);

		if (obj.angle) {
			groupElement.attr('transform', `${groupElement.attr('transform')} rotate(${obj.angle})`);
		}

		obj.objects?.forEach((childObj: any) => {
			const childId = String(childObj.id);
			const childReservation = reservations.find(
				(seat: any) => String(seat.object_id) === childId
			);
 
			if (childReservation) {
				if (childReservation.status === ReservationStatusEnum.ACCEPT) {
					childObj.fill = '#ff176b';
					childObj.stroke = '#ff176b';
					childObj.strokeWidth = 3;
				} else if (childReservation.status === ReservationStatusEnum.PENDING) {
					childObj.fill = '#A0B0C2';
					childObj.stroke = '#A0B0C2';
					childObj.strokeWidth = 3;
				}
			}

			switch (childObj.type) {
				case 'rect':
					renderRect(groupElement, childObj);
					break;
				case 'i-text':
					renderText(groupElement, childObj);
					break;
				case 'triangle':
					renderTriangle(groupElement, childObj);
					break;
				case 'circle':
					renderCircle(groupElement, childObj);
					break;
				default:
					console.warn(`Unsupported child object type in group: ${childObj.type}`);
			}
		});
	};

	const renderImage = (group: any, obj: any) => {
		const x = obj.left;
		const y = obj.top;
		const width = obj.width * (obj.scaleX || 1);
		const height = obj.height * (obj.scaleY || 1);

		group.append('image')
			.attr('x', x)
			.attr('y', y)
			.attr('width', width)
			.attr('height', height)
			.attr('href', obj.src || '')
			.attr('preserveAspectRatio', 'none')
			.attr('transform', obj.angle ? `rotate(${obj.angle}, ${x + width/2}, ${y + height/2})` : null);
	};
</script>

<div class="seating-container">
	<!-- SVG container with aspect ratio preservation -->
	<div class="svg-wrapper w-full relative overflow-hidden border border-gray-300 rounded">
		<div class="svg-aspect-ratio" style="padding-top: {(activeSeat?.design?.height / activeSeat?.design?.width) * 100}%">
			<svg id="seating-chart" class="svg-content" />
		</div>
	</div>
</div>

<style>
	.seating-container {
		position: relative;
		width: 100%;
		overflow: hidden;
	}

	.svg-wrapper {
		position: relative;
		width: 100%;
	}

	.svg-aspect-ratio {
		position: relative;
		width: 100%;
	}

	.svg-content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #f0f0f0;
	}

	/* Make sure SVG scales properly on mobile */
	@media (max-width: 768px) {
		.svg-wrapper {
			margin: 0 auto;
			max-width: 100vw;
		}
	}
	
</style>
