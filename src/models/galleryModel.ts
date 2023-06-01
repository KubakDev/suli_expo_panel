import type { LanguageEnum } from './languageEnum';

export interface GalleryModel {
	id?: number;
	images: string[];
	thumbnail?: string;
	created_at?: Date;
}

export interface GalleryModelLang {
	id?: number;
	title?: string;
	short_description?: string;
	long_description?: string;
	language: LanguageEnum;
	created_at?: Date;
}
