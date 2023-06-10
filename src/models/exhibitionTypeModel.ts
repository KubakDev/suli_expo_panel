import type { LanguageEnum } from './languageEnum';

export interface ExhibitionModel {
	id: number;
	image: string[];
	exhibition_date?: Date;
	exhibition_type: string;
	exhibition_languages?: ExhibitionModelLang[];
}

export interface ExhibitionModelLang {
	id?: number;
	title?: string;
	description?: string;
	language: LanguageEnum;
	created_at?: Date;
}
