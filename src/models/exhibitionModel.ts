import type { LanguageEnum } from './languageEnum';

export interface ExhibitionsModel {
	id: number;
	images: string[];
	pdf_files: string[];
	thumbnail: string;
	country_number: number;
	company_number: number;
	exhibition_type: string;
	start_date: Date;
	end_date: Date;
	exhibition_languages?: ExhibitionsModelLang[];
}

export interface ExhibitionsModelLang {
	id?: number;
	story: string;
	video_youtube_link: string;
	title: string;
	description: string;
	language: LanguageEnum;
}
