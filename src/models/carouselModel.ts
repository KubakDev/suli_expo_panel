import type { LanguageEnum } from './languageEnum';

export interface CarouselModel {
	id?: number;
	images?: string;
	title?: string;
	subtitle?: string;
	link?: string;
	type?: string;
	language?: LanguageEnum;
	created_at?: Date;
}

export interface CarouselModelLang {
	id?: number;
	title?: string;
	subtitle?: string;
	language?: LanguageEnum;
}
