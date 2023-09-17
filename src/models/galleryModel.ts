import type { LanguageEnum } from './languageEnum';

export interface GalleryModel {
	id: number;
	exhibition_id?: number;
	images: string[] | string;
	thumbnail: string;
	exhibition_type?: string;
	created_at?: Date;
	gallery_languages?: GalleryModelLang[];
}

export interface GalleryModelLang {
	id?: number;
	title: string;
	short_description: string;
	long_description: string;
	language: LanguageEnum;
	created_at?: Date;
}
