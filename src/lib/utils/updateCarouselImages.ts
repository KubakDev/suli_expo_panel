// imageHelper.js

import { ImgSourceEnum } from '../../models/imgSourceEnum';

export function getImagesObject(exhibitionsData: any) {
	let carouselImages = exhibitionsData.images.map((image, i) => {
		return {
			id: i,
			imgurl: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`,
			imgSource: ImgSourceEnum.remote,
			name: image,
			attribution: ''
		};
	});

	if (carouselImages.length <= 0) {
		carouselImages = undefined;
	}

	return carouselImages;
}
