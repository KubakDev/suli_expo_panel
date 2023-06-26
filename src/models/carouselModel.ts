import type { LanguageEnum } from './languageEnum';

export interface CarouselModel {
	id?: number;
	image: string;
	link: string;
	type: CarouselTypeEnum;
	created_at?: Date;
	carousel_languages?: CarouselModelLang[];
}

export enum CarouselTypeEnum {
	Internal = 'Internal',
	External = 'External'
}

export interface CarouselModelLang {
	id?: number;
	title: string;
	subtitle: string;
	language: LanguageEnum;
}
