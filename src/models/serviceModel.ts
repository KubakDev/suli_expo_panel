import type { LanguageEnum } from './languageEnum';

export interface ServiceModel {
	id: number;
	exhibition_id?: number;
	thumbnail: string;
	exhibition_type?: string;
	primaryColor?: string;
	onPrimaryColor?: string;
	service_languages?: ServiceModelLang[];
}

export interface ServiceModelLang {
	id?: number;
	title: string;
	short_description: string;
	language: LanguageEnum;
}
