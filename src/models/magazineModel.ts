import type { LanguageEnum } from './languageEnum';

export interface MagazineModel {
	id?: number;
	exhibition_id?: number;
	images: string[] | string;
	pdf_files: string[] | string;
	thumbnail: string;
	exhibition_type?: '';
	created_at?: Date;
	magazine_languages?: MagazineModelLang[];
}

export interface MagazineModelLang {
	id?: number;
	title: string;
	short_description: string;
	long_description: string;
	language: LanguageEnum;
	created_at?: Date;
}
