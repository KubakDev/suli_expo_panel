import type { LanguageEnum } from './languageEnum';

export interface ExhibitionsModel {
	id: number;
	images: string[];
	pdf_files: string[];
	thumbnail: string;
	country_number: number;
	company_number: number;
	video_youtube_id: string;
	exhibition_type: string;
	exhibition_date: Date;
	exhibition_languages?: ExhibitionsModelLang[];
}

export interface ExhibitionsModelLang {
	id?: number;
	title: string;
	description: string;
	language: LanguageEnum;
}
