import type { LanguageEnum } from './languageEnum';

export interface seatServicesModel {
	id: number;
	icon: string;
	created_at?: Date;
	languages?: seatServicesModelLang[];
}

export interface seatServicesModelLang {
	id?: number;
	title: string;
	description: string;
	language: LanguageEnum;
}
