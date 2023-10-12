import type { LanguageEnum } from './languageEnum';

export interface AboutModel {
	id: number;
	image?: string;
	created_at?: Date;
	about_languages?: AboutModelLang[];
	
}

export interface AboutModelLang {
	id?: number;
	short_description: string;
	long_description: string;
	language: LanguageEnum;
	created_at?: Date;
}
