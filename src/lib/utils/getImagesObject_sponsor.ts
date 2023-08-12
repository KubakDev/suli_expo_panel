import { ImgSourceEnum } from '../../models/imgSourceEnum';

export function getImagesObject_sponsor(sponsorImageUrls) {
	const carouselImages_sponsor = sponsorImageUrls.map((image, i) => {
		return {
			id: i,
			imgurl: `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${image}`,
			imgSource: ImgSourceEnum.remote,
			name: image,
			attribution: ''
		};
	});

	return carouselImages_sponsor.length > 0 ? carouselImages_sponsor : undefined;
}
