// imageHelper.js

import { ImgSourceEnum } from "../../../models/imgSourceEnum";


interface ExhibitionData {
	images: string[];
}

export function getImagesObject(exhibitionsData: ExhibitionData) {
	let carouselImages:
		| {
				id: number;
				imgurl: string;
				imgSource: ImgSourceEnum;
				name: string;
				attribution: string;
		  }[]
		| undefined = exhibitionsData.images.map((image, i) => {
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
