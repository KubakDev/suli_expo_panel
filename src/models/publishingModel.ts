import type { LanguageEnum } from './languageEnum';

export interface PublishingModel {
	id?: number;
	images: string[] | string;
	thumbnail?: string;
	created_at?: Date;
	publishing_languages?: PublishingModelLang[];
}

export interface PublishingModelLang {
	id?: number;
	title?: string;
	short_description?: string;
	long_description?: string;
	language: LanguageEnum;
	created_at?: Date;
}
