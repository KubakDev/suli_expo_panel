export interface CreateNews {
	title: string;
	description: string;
}
export interface NewsModel {
	id: number;
	news_languages: NewsLanguage[];
	thumbnail?: string;
	images: string[];
	imagesCarousel: CarouselImage[];
}

export interface NewsLanguage {
	id: number;
	news_id: number;
	language_id: number;
	title: string;
	short_description: string;
	long_description: string;
}

interface CarouselImage {
	id: number;
	name: string;
	imgurl: string;
	attribution: string;
}
