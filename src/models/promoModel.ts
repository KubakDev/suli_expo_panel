import type { LanguageEnum } from './languageEnum';

export interface PromoModel {
	id?: number;
	thumbnail: string;
	exhibition_id?: number;
	promo_languages?: PromoModelLang[];
}

export interface PromoModelLang {
	id?: number;
	title: string;
	video_link: string;
	language: LanguageEnum;
}
