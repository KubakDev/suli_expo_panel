import { ImgSourceEnum } from '../../models/imgSourceEnum';

export function getImagesObject(imageUrls) {
	const carouselImages = imageUrls.map((image, i) => {
		return {
			id: i,
			imgurl: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`,
			imgSource: ImgSourceEnum.remote,
			name: image,
			attribution: ''
		};
	});

	return carouselImages.length > 0 ? carouselImages : undefined;
}
