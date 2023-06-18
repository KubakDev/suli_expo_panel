export interface CreateNews {
	title: string;
	description: string;
}
export interface News {
	images: string[];
	thumbnail: string;
	news_languages: NewsLanguage[];
}
export interface NewsLanguage {
	title: string;
	long_description: string;
	short_description: string;
	language: string;
}
