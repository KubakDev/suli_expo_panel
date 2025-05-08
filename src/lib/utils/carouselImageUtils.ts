export type CarouselImage = {
    id: number;
    imgurl: string;
    name: string;
    attribution: string;
    imgSource?: string;
};

export function convertToCarouselImages(images: any[] | undefined): CarouselImage[] | undefined {
    if (!images) return undefined;
    return images.map(img => ({
        ...img,
        name: img.name || 'image',
        attribution: img.attribution || ''
    }));
}

export function getImagesObject(data: { images: string | string[] }): CarouselImage[] | undefined {
    if (!data.images) return undefined;
    
    const imagesArray = Array.isArray(data.images) ? data.images : [data.images];
    
    return imagesArray.map((image, index) => ({
        id: index,
        imgurl: image,
        name: image.split('/').pop() || 'image',
        attribution: '',
        imgSource: 'remote'
    }));
}
