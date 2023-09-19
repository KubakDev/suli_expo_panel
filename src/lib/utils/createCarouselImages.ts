export function createCarouselImages(images: File[]) {
	return images.map((image, i) => {
		const imgUrl = URL.createObjectURL(image);
		return {
			id: i,
			imgurl: imgUrl,
			name: image,
			attribution: ''
		};
	});
}
