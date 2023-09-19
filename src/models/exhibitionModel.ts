import type { LanguageEnum } from './languageEnum';

export interface ExhibitionsModel {
	id: number;
	images: string[] | string;
	thumbnail: string;
	country_number: number;
	image_map: string;
	company_number: number;
	exhibition_type: string;
	deleted_status: string | null;
	start_date: Date;
	end_date: Date;
	position?: number;
	sponsor_images: string[] | string;
	sponsor_title: string;
	exhibition_languages?: ExhibitionsModelLang[];
}

export interface ExhibitionsModelLang {
	id?: number;
	story: string;
	video_youtube_link: string;
	title: string;
	pdf_files: string;
	contract_file: string;
	description: string;
	location: string;
	location_title: string;
	brochure: string;
	map_title: string;
	language: LanguageEnum;
}
