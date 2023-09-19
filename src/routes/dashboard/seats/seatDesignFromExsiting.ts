import { appendShapeToPlaceHolder } from "./seatDesignUtils";
import type { SeatDesignModel, SeatLayoutModel } from "./seatLayoutStore";

export async function showSelectedDesign(design: SeatLayoutModel, d3: any, placeHolder: string) {
    // show seat desing inside svg

    await new Promise((resolve) => setTimeout(resolve, 500));
    const container = d3.select(placeHolder);
    // get contianer width and height
    const htmlElemtn = container.node() as HTMLElement;


    const containerWidth = htmlElemtn.clientWidth;
    const containerHeight = htmlElemtn.clientHeight;




    // return;
    // show seat design inside svg
    let seats = [];
    for (let i = 0; i < design.seats.length; i++) {
        const seat = design.seats[i];
        const seatWidth = (seat.width! / 100) * containerWidth;
        const seatHeight = (seat.height! / 100) * containerHeight;

        const seatX = (seat.x! / 100) * containerWidth;
        const seatY = (seat.y! / 100) * containerHeight;
        appendShapeToPlaceHolder(placeHolder, d3, seat.image_url, seatWidth, seatHeight, seatX, seatY, seat)
        // const seatDesign = d3
        //     .select(placeHolder)
        //     .append('g')
        //     // add random class
        //     .datum('')
        //     .attr(
        //         'transform',
        //         `translate(${seatX},${seatY}) rotate(${seat.rotation}, ${seatWidth / 2},  ${seatHeight / 2
        //         })`
        //     )
        //     .attr('data-rotation', '0')
        //     .on('click', (event: any, d: any) => { });

        // if (seat.image_url) {
        //     createRectWithImageBackground(seat, seatDesign, seatWidth, seatHeight);
        // } else {
        //     seatDesign
        //         .append('rect')
        //         .attr('width', seatWidth)
        //         .attr('height', seatHeight)
        //         // fill color
        //         .attr('fill', seat.fill_color!)
        //         .attr('stroke', seat.stroke_color!)
        //         .attr('stroke-width', seat.stroke_width!)
        //         .attr('rx', seat.border_radius || 0)
        //         .attr('ry', seat.border_radius || 0)
        //         .on('click', function () { });
        // }
    }

}

function createRectWithImageBackground(
    seat: SeatDesignModel,
    clonedSeat: d3.Selection<SVGGElement, any, any, any>,
    seatWidth: number,
    seatHeight: number
) {
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
        .attr('href', seat.image_url!)
        .attr('width', seatWidth) // Set width and height to match the pattern's dimensions
        .attr('height', seatHeight);

    // Append a rect with the image pattern as its fill
    clonedSeat
        .append('rect')
        .attr('width', seatWidth)
        .attr('height', seatHeight)
        .attr('fill', `url(#image-pattern-${randomId})`)
        .attr('stroke', seat.stroke_color!)
        .attr('stroke-width', seat.stroke_width!)
        .attr('rx', seat.border_radius || 0)
        .attr('ry', seat.border_radius || 0)
        .on('click', function () { });
}

