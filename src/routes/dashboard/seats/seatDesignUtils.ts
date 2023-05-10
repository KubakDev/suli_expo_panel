import { seatItemStore } from "./seatItemStore";
import type { SeatDesignModel } from "./seatLayoutStore";


const appendShapeToPlaceHolder = (placeHolder: string, d3: any, image: string | null = null, seatWidth: number = 20, seatHeight: number = 20, seatX: number = 5, seatY: number = 5, seat: SeatDesignModel | null = null) => {
    let svg: SVGSVGElement;

    const randomId = `seat-${Math.floor(Math.random() * 100000)}`;
    const clonedSeat: d3.Selection<SVGGElement, any, any, any> = d3.select(placeHolder)
        .append('g')
        // add random class
        .attr('id', randomId)
        .datum('')
        .attr(
            'transform',
            `translate(${seatX},${seatY}) rotate(${seat && seat.rotation ? seat.rotation : 0}, ${seatWidth / 2},  ${seatHeight / 2
            })`
        )
        .attr('data-rotation', seat && seat.rotation ? seat.rotation : 0)
        .call(
            d3
                .drag()
                .on('start', dragstarted)
                .on('end', (event: any) => dragended(event, clonedSeat))
                .on('drag', (event: any) => dragged(event, clonedSeat)) as any
        )
        .on('click', (event: any, d: any) => {
            selectSeatItem(randomId);
        });
    if (image) {
        createRectWithImageBackground(image, clonedSeat, seatWidth, seatHeight, seat);
    } else {
        clonedSeat
            .append('rect')
            .attr('width', seatWidth)
            .attr('height', seatHeight)
            // fill color
            .attr('fill', seat?.fill_color || '#000')
            .attr('stroke', seat?.stroke_color || '#000')
            .attr('stroke-width', seat?.stroke_width || 0)
            .attr('rx', seat?.border_radius || 0)
            .attr('ry', seat?.border_radius || 0).on('click', function () {
                hideHandlers(d3);
                showHndlers();
            });
    }


    const resizeHandle = clonedSeat
        .append('circle')
        .attr('class', 'resize-handle')
        .attr('cx', seatWidth)
        .attr('cy', seatHeight)
        .attr('r', 5)
        .attr('fill', 'green')
        .style('display', 'none')
        .call(
            d3.drag().on('drag', (event: any) => {
                resize(event, clonedSeat);
            }) as any
        );

    function resize(
        event: d3.D3DragEvent<any, any, any>,
        seatGroup: d3.Selection<SVGGElement, any, any, any>
    ) {

        const newWidth = Math.max(20, event.x);
        const newHeight = Math.max(20, event.y);
        seatGroup.select('rect').attr('width', newWidth).attr('height', newHeight);
        seatGroup
            .select('text')
            .attr('x', newWidth / 2)
            .attr('y', newHeight / 2);
        if (seatGroup.select('pattern').node() && seatGroup.select('image').node()) {
            seatGroup.select('pattern').attr('width', newWidth).attr('height', newHeight);
            seatGroup.select('image').attr('width', newWidth).attr('height', newHeight);
        }
        seatGroup.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
        seatGroup.select('.rotate-handle').attr('cx', newWidth / 2);

        selectSeatItem(randomId);
    }

    const rotateHandle = clonedSeat
        .append('circle')
        .attr('class', 'rotate-handle')
        .attr('cx', seatWidth / 2)
        .attr('cy', 0)
        .attr('r', 5)
        .style('display', 'none')
        .attr('fill', 'red')
        .call(
            d3.drag()
                .on('drag', (event: any) => rotate(event, clonedSeat))
                .on('end', (event: d3.D3DragEvent<any, any, any>) => {
                })
        );


    let initialMouseX = 0;
    let initialMouseY = 0;
    let dragStarted = false;

    function dragstarted(event: any) {
        hideHandlers(d3);
        showHndlers();
        initialMouseX = event.x;
        initialMouseY = event.y;
        dragStarted = true;
    }

    function dragged(event: any, seatGroup: d3.Selection<SVGGElement, any, any, any>) {
        const currentRotation = parseInt(seatGroup.attr('data-rotation') || '0');
        const rectElement = seatGroup.select('rect').node() as SVGRectElement;
        const bbox = rectElement.getBBox();

        const transform = seatGroup.attr('transform');
        const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;
        const translateMatch = transform.match(translateRegex);
        const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
        const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;

        const currentMouseX = event.x;
        const currentMouseY = event.y;

        const deltaX = currentMouseX - initialMouseX;
        const deltaY = currentMouseY - initialMouseY;
        initialMouseX = currentMouseX;
        initialMouseY = currentMouseY;
        const finlaX = translateX + deltaX;
        const finlaY = translateY + deltaY;

        seatGroup.attr(
            'transform',
            `translate(${finlaX},${finlaY}) rotate(${currentRotation},${bbox.width / 2},${bbox.height / 2
            })`
        );

        // Show the rotated element again after the drag is complete
        d3.timeout(() => {
            seatGroup.select('rect').style('opacity', 1);
        }, 0);
        selectSeatItem(randomId);
    }

    function dragended(event: any, seatGroup: d3.Selection<SVGGElement, any, any, any>) {
        initialMouseX = 0;
        initialMouseY = 0;
        const transform = seatGroup.attr('transform');
        const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;
        const translateMatch = transform.match(translateRegex);
        const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
        const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
    }

    let startAngle: number | null = null;

    function rotate(
        event: any,
        clonedSeat: d3.Selection<SVGGElement, any, any, any>
    ) {
        // check if shift key is pressed
       
        const isShiftKey = event.sourceEvent.shiftKey;

        const translation = clonedSeat.attr('transform').match(/translate\(([\d.]+),([\d.]+)\)/);
        const translateX = translation ? parseFloat(translation[1]) : 0;
        const translateY = translation ? parseFloat(translation[2]) : 0;
        // Get the bounding box of the clonedSeat
        const boxWidth = parseFloat(clonedSeat.select('rect').attr('width'));
        const boxHeigh = parseFloat(clonedSeat.select('rect').attr('height'));

        // Calculate the center of the clonedSeat
        const centerX = translateX + boxWidth / 2;
        const centerY = translateY + boxHeigh / 2;

        // Calculate the angle between the current mouse position and the center of the clonedSeat
        const dx = event.sourceEvent.layerX - centerX;
        const dy = event.sourceEvent.layerY - centerY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (startAngle === null) {
            startAngle = angle;
        }
        // const angleDifference = angle - startAngle;
        const angleDifference = angle - startAngle;

        const currentRotation = parseFloat(clonedSeat.attr('data-rotation')) || 0;
        const newRotation = currentRotation + angleDifference;

        // Update the transform attribute to maintain the position while rotating
        clonedSeat
            .attr('data-rotation', newRotation)
            .attr(
                'transform',
                `translate(${translateX},${translateY}) rotate(${newRotation}, ${boxWidth / 2}, ${boxHeigh / 2})`
            );

        startAngle = angle;
        selectSeatItem(randomId);
    }

    function selectSeatItem(item: string) {
        const seatItemData = getSeatItemData(item, d3);


        seatItemStore.setItem(seatItemData);
    }

    function createRectWithImageBackground(imageUrl: string, clonedSeat: d3.Selection<SVGGElement, any, any, any>, seatWidth: number, seatHeight: number, seat: SeatDesignModel | null = null) {

        // Create a pattern and set the image as its background
        // generate random id
        const randomId = Math.random().toString(36).substring(7);
        const pattern = clonedSeat
            .append('pattern')
            .attr('id', 'image-pattern' + '-' + randomId)
            .attr('patternUnits', 'userSpaceOnUse') // Change patternUnits to userSpaceOnUse
            .attr('width', seatWidth) // Set width and height to match the rect's dimensions
            .attr('height', seatHeight);

        pattern
            .append('image')
            .attr('href', imageUrl)
            .attr('width', seatWidth) // Set width and height to match the pattern's dimensions
            .attr('height', seatHeight);

        // Append a rect with the image pattern as its fill
        clonedSeat
            .append('rect')
            .attr('width', seatWidth)
            .attr('height', seatHeight)
            .attr('fill', `url(#image-pattern-${randomId})`)
            .attr('rx', seat?.border_radius || 0)
            .attr('ry', seat?.border_radius || 0).on('click', function () {
                hideHandlers(d3);
                showHndlers();
            });;
    }

    function showHndlers() {
        resizeHandle.style('display', 'inherit');
        rotateHandle.style('display', 'inherit');
    }


}


const hideHandlers = (d3: any) => {
    const resizeHandler = d3.selectAll('.resize-handle');
    const rotateHandler = d3.selectAll('.rotate-handle');
    // loop through all the resize handles and hide them
    resizeHandler.style('display', 'none');
    rotateHandler.style('display', 'none');
}

const getSeatItemData = (seatItemId: string, d3: any) => {

    const seatItem = d3.select(`#${seatItemId}`);
    const boxWidth = parseFloat(seatItem.select('rect').attr('width'));
    const boxHeigh = parseFloat(seatItem.select('rect').attr('height'));
    const rotation = parseFloat(seatItem.attr('data-rotation')) || 0;
    const price = parseFloat(seatItem.attr('data-price')) || 0;
    const radius = parseFloat(seatItem.select('rect').attr('rx'));
    const fillColor = seatItem.select('rect').attr('fill');
    const isSelectable = seatItem.attr('data-isSelectable') === 'true' ? true : false || false;
    const transform = seatItem.attr('transform');
    const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;
    const translateMatch = transform.match(translateRegex);
    const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
    const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
    const initialItem = {
        id: seatItemId,
        price: price,
        rotation,
        radius,
        isSelectable: isSelectable,
        width: boxWidth,
        height: boxHeigh,
        x: translateX,
        y: translateY,
        fillColor: fillColor
    };
    return initialItem;
}


export { appendShapeToPlaceHolder, getSeatItemData, hideHandlers };