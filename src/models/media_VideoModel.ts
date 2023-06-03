import type { LanguageEnum } from './languageEnum';

export interface VideoModel {
	id?: number;
	thumbnail?: string;
	created_at?: Date;
	link?: string;
	mediaVideo_languages?: VideoModelLang[];
}

export interface VideoModelLang {
	id?: number;
	title?: string;
	short_description?: string;
	long_description?: string;
	language: LanguageEnum;
	created_at?: Date;
}
