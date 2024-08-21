import type { LanguageEnum } from './languageEnum';

export interface NewsModel {
	id: number;
	exhibition_id?: number;
	images: string[] | string;
	thumbnail: string;
	created_at: string;
	news_languages?: NewsModelLang[];
}

export interface NewsModelLang {
	id?: number;
	title: string;
	short_description: string;
	long_description: string;
	language: LanguageEnum;
	created_at?: Date;
}
