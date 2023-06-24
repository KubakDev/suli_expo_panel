import type { LanguageEnum } from './languageEnum';

export interface ExhibitionsModel {
	id: number;
	exhibition_id?: number;
	images: string[];
	thumbnail: string;
	video_youtube_id: string;
	exhibition_type: string;
	created_at: Date;
	gallery_languages?: ExhibitionsModelLang[];
}

export interface ExhibitionsModelLang {
	id?: number;
	title: string;
	description: string;
	language: LanguageEnum;
}
