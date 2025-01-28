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

		if (container) {
			container.style.height = `${containerWidth / aspectRatio}px`;
		}

		if (svg) {
			svg.attr('viewBox', `0 0 ${width} ${height}`)
				.attr('preserveAspectRatio', 'xMidYMid meet');
		}
	};

	const loadSeats = async () => {
		if (!activeSeat?.design?.objects) {
			console.error("No design objects found in the data!");
			return;
		}

		// Set up SVG
		svg = d3.select('#seating-chart')
			.attr('width', '100%')
			.attr('height', '100%');

		adjustViewBox();

		// Clear previous elements
		svg.selectAll('*').remove();

		// Create main group
		const mainGroup = svg.append('g');

		// Process and render objects
		activeSeat.design.objects.forEach((obj: any) => {
			const objId = String(obj.id);
			const reservedSeat = reservations.find(
				(seat: any) => String(seat.object_id) === objId
			);

			console.log('Processing object:', {
				objId,
				reservedSeat,
				status: reservedSeat?.status,
				isAccepted: reservedSeat?.status === ReservationStatusEnum.ACCEPT
			});

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
				case 'image':
					renderImage(mainGroup, obj);
					break;
				default:
					console.warn(`Unsupported object type: ${obj.type}`);
			}
		});
	};

	const renderRect = (group: any, obj: any) => {
		// Debug log for each seat being rendered
		console.log('Rendering seat:', {
			seatId: obj.id,
			reservation: reservations.find(r => String(r.object_id) === String(obj.id)),
			fill: obj.fill,
			stroke: obj.stroke
		});

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

			console.log('Processing group child:', {
				childId,
				childReservation,
				status: childReservation?.status,
				isAccepted: childReservation?.status === ReservationStatusEnum.ACCEPT
			});

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

<div bind:this={container} class="min-h-[200px] w-full relative overflow-hidden border border-gray-300">
	<svg id="seating-chart" />
</div>

<style>
	#seating-chart {
		width: 100%;
		height: 100%;
		background-color: #f0f0f0;
	}
</style>
