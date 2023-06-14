import type { LanguageEnum } from './languageEnum';

export interface ServiceModel {
	id: number;
	exhibition_id?: number;
	thumbnail: string;
	exhibition_type?: string;
	created_at?: Date;
	gallery_languages?: ServiceModelLang[];
	primaryColor?: string;
	onPrimaryColor?: string;
}

export interface ServiceModelLang {
	id?: number;
	title: string;
	short_description?: string;
	language: LanguageEnum;
}
