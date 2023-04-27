import { seatItemStore } from "./seatItemStore";


const appendShapeToPlaceHolder = (placeHolder: string, d3: any) => {
    let svg: SVGSVGElement;
    console.log(d3.select('svg'))
    const randomId = `seat-${Math.floor(Math.random() * 100000)}`;
    const clonedSeat: d3.Selection<SVGGElement, any, any, any> = d3.select(placeHolder)
        .append('g')
        // add random class
        .attr('id', randomId)
        .datum('')
        .attr('transform', `translate(20,20)`)
        .attr('data-rotation', '0')
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

    clonedSeat
        .append('rect')
        .attr('width', 50)
        .attr('height', 50)
        // fill color
        .attr('fill', `#${Math.floor(Math.random() * 16777215).toString(16)}`)
        .attr('rx', 5)
        .attr('ry', 5);

    clonedSeat
        .append('circle')
        .attr('class', 'resize-handle')
        .attr('cx', 50)
        .attr('cy', 50)
        .attr('r', 5)
        .attr('fill', 'green')
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
        seatGroup.select('.resize-handle').attr('cx', newWidth).attr('cy', newHeight);
        seatGroup.select('.rotate-handle').attr('cx', newWidth / 2);

        selectSeatItem(randomId);
    }

    clonedSeat
        .append('circle')
        .attr('class', 'rotate-handle')
        .attr('cx', 25)
        .attr('cy', 0)
        .attr('r', 5)
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
        initialMouseX = event.x;
        initialMouseY = event.y;
        console.log('start', initialMouseX, initialMouseY);
        dragStarted = true;
    }

    function dragged(event: any, seatGroup: d3.Selection<SVGGElement, any, any, any>) {
        console.log(event.x, event.y);
        // selectedItem(seatGroup);
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
        console.log('end', initialMouseX, initialMouseY);
        const transform = seatGroup.attr('transform');
        const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;
        const translateMatch = transform.match(translateRegex);
        const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
        const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;

        console.log('dragended translateX', translateX, 'dragended translateY', translateY);
        // You can add additional logic here when the dragging ends
        // const target = event.sourceEvent.target as HTMLElement;
        // if (target.classList.contains('rotate-handle')) {
        // 	rotate(event.sourceEvent as any, d3.select(event.subject));
        // } else if (target.classList.contains('resize-handle')) {
        // 	resize(event.sourceEvent as any, d3.select(event.subject));
        // }
    }

    let startAngle: number | null = null;

    function rotate(
        event: any,
        clonedSeat: d3.Selection<SVGGElement, any, any, any>
    ) {
       
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
        console.log('currentRotation', currentRotation);
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

}

const getSeatItemData = (seatItemId: string, d3: any) => {

    const seatItem = d3.select(`#${seatItemId}`);
    const boxWidth = parseFloat(seatItem.select('rect').attr('width'));
    const boxHeigh = parseFloat(seatItem.select('rect').attr('height'));
    const rotation = parseFloat(seatItem.attr('data-rotation')) || 0;
    const price = parseFloat(seatItem.attr('data-price')) || 0;
    const isSelectable = seatItem.attr('data-isSelectable') ? Boolean(seatItem.attr('data-isSelectable')) : false || false;

    const transform = seatItem.attr('transform');
    const translateRegex = /translate\((-?[\d.]+),\s*(-?[\d.]+)\)/;
    const translateMatch = transform.match(translateRegex);
    const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
    const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;

    const initialItem = {
        id: seatItemId,
        price: price,
        rotation,
        isSelectable: isSelectable,
        width: boxWidth,
        height: boxHeigh,
        x: translateX,
        y: translateY,
    };
    return initialItem;
}


export { appendShapeToPlaceHolder, getSeatItemData };