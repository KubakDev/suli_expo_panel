import type { LanguageEnum } from './languageEnum';

export interface CarouselModel {
	id?: number;
	image: string;
	title: string;
	subtitle: string;
	link?: string;
	type: CarouselTypeEnum;
	language?: LanguageEnum;
	created_at?: Date;
}

export enum CarouselTypeEnum {
	Internal = 'Internal',
	External = 'External'
}

export interface CarouselModelLang {
	id?: number;
	title?: string;
	subtitle?: string;
	language: LanguageEnum;
}
